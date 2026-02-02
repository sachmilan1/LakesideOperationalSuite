import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { db } from "../../../../FirebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const DAY_LABELS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ---- helpers ----
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const mondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();                 // 0..6 (Sun..Sat)
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export default function TimeCardByUser() {
  const { userId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState("");
  const [unionDues, setUnionDues] = useState("");
  const [notes, setNotes] = useState("");

  // Keep strings while typing; convert to numbers on save
  const [days, setDays] = useState([]); // {label,date,clockIn,clockOut,breakText,floatText,jobNumber,totalText,expanded}

  const weekStart = useMemo(() => mondayOfWeek(), []);
  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);

  const todayIndex = useMemo(() => {
    const dow = new Date().getDay(); // 0..6
    return dow === 0 ? 6 : dow - 1;
  }, []);

  const makeEmptyDays = () =>
    DAY_LABELS.map((label, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        label,
        date: toISODate(d),
        clockIn: "",
        clockOut: "",
        breakText: "",
        floatText: "",
        jobNumber: "",
        totalText: "",
        expanded: i === todayIndex,
      };
    });

  // Subscribe/create doc: timeCards/{weekStartISO}/cards/{userId}
  useEffect(() => {
    const uid = String(userId || "").trim();
    if (!uid) return;

    const ref = doc(db, "timeCards", weekStartISO, "cards", uid);
    let unsub;

    (async () => {
      setLoading(true);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          userId: uid,
          employeeName: "",
          weekStart: weekStartISO,
          // Store normalized numbers in Firestore; UI uses strings
          days: makeEmptyDays().map(({ expanded, breakText, floatText, totalText, ...rest }) => ({
            ...rest,
            breakMinutes: 0,
            floatHours: 0,
            totalHours: 0,
          })),
          weeklyTotal: 0,
          unionDues: 0,
          notes: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      unsub = onSnapshot(ref, (docSnap) => {
        const data = docSnap.data();
        if (!data) return;
        const loaded = (data.days || []).map((row, i) => ({
          label: row.label,
          date: row.date,
          clockIn: row.clockIn || "",
          clockOut: row.clockOut || "",
          breakText:
            row.breakMinutes === 0 || row.breakMinutes === undefined ? "" : String(row.breakMinutes),
          floatText:
            row.floatHours === 0 || row.floatHours === undefined ? "" : String(row.floatHours),
          jobNumber: row.jobNumber || "",
          totalText:
            row.totalHours === 0 || row.totalHours === undefined ? "" : String(row.totalHours),
          expanded: i === todayIndex,
        }));
        setDays(loaded.length ? loaded : makeEmptyDays());
        setEmployeeName(data.employeeName || "");
        setUnionDues(
          data.unionDues !== undefined && data.unionDues !== null ? String(data.unionDues) : ""
        );
        setNotes(data.notes || "");
        setLoading(false);
      });
    })();

    return () => unsub && unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, weekStartISO]);

  const setDayPatch = (idx, patch) =>
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  const toggleExpand = (idx) =>
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, expanded: !d.expanded } : d)));

  const weeklyTypedTotal = useMemo(() => {
    const sum = days.reduce((acc, d) => {
      const n = parseFloat((d.totalText || "").replace(/[^0-9.]/g, ""));
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
    return round2(sum);
  }, [days]);

  const buildFirestoreDays = () =>
    days.map((d) => {
      const breakMinutes = parseInt((d.breakText || "").replace(/[^0-9]/g, ""), 10);
      const floatHours = parseFloat((d.floatText || "").replace(/[^0-9.]/g, ""));
      const totalHours = parseFloat((d.totalText || "").replace(/[^0-9.]/g, ""));
      return {
        label: d.label,
        date: d.date,
        clockIn: d.clockIn || "",
        clockOut: d.clockOut || "",
        breakMinutes: isNaN(breakMinutes) ? 0 : breakMinutes,
        floatHours: isNaN(floatHours) ? 0 : floatHours,
        jobNumber: d.jobNumber || "",
        totalHours: isNaN(totalHours) ? 0 : totalHours, // <- user-typed
      };
    });

  const saveDay = async (idx) => {
    const uid = String(userId || "").trim();
    if (!uid) return Alert.alert("Missing user", "No userId in route.");
    const ref = doc(db, "timeCards", weekStartISO, "cards", uid);

    const toSave = buildFirestoreDays();

    try {
      await updateDoc(ref, {
        days: toSave,
        weeklyTotal: toSave.reduce((a, b) => a + (b.totalHours || 0), 0),
        employeeName: employeeName || "",
        unionDues: unionDues ? Number(unionDues) : 0,
        notes: notes || "",
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Saved", `${days[idx].label} saved.`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save day.");
    }
  };

  const saveWeekMeta = async () => {
    const uid = String(userId || "").trim();
    if (!uid) return;
    const ref = doc(db, "timeCards", weekStartISO, "cards", uid);

    const toSave = buildFirestoreDays();

    try {
      await updateDoc(ref, {
        days: toSave,
        weeklyTotal: toSave.reduce((a, b) => a + (b.totalHours || 0), 0),
        employeeName: employeeName || "",
        unionDues: unionDues ? Number(unionDues) : 0,
        notes: notes || "",
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Saved", "Week details saved.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save week details.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator />
        <Text style={{ color: "#6b7280", marginTop: 6 }}>Loading time card…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Time Card</Text>
      <Text style={styles.subtitle}>
        User: <Text style={styles.bold}>{String(userId)}</Text> — Week of{" "}
        <Text style={styles.bold}>{weekStartISO}</Text>
      </Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Employee Name</Text>
          <TextInput
            value={employeeName}
            onChangeText={setEmployeeName}
            placeholder="Jane Doe"
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
        <View style={[styles.col, { maxWidth: 140 }]}>
          <Text style={styles.label}>Union Dues</Text>
          <TextInput
            value={unionDues}
            onChangeText={(t) => setUnionDues(t.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            style={styles.input}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={{ marginBottom: 8 }}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes…"
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          multiline
        />
      </View>

      {days.map((d, idx) => (
        <View key={d.label} style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(idx)}>
            <Text style={styles.cardTitle}>{d.label}</Text>
            <Text style={styles.datePill}>{d.date}</Text>
          </TouchableOpacity>

          {d.expanded && (
            <View style={{ marginTop: 8 }}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Clock In</Text>
                  <TextInput
                    value={d.clockIn}
                    onChangeText={(t) => setDayPatch(idx, { clockIn: t })}
                    placeholder="e.g. 8:00 AM"
                    style={styles.input}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Clock Out</Text>
                  <TextInput
                    value={d.clockOut}
                    onChangeText={(t) => setDayPatch(idx, { clockOut: t })}
                    placeholder="e.g. 4:30 PM"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.col, { maxWidth: 120 }]}>
                  <Text style={styles.label}>Break (min)</Text>
                  <TextInput
                    value={d.breakText}
                    onChangeText={(t) =>
                      setDayPatch(idx, { breakText: t.replace(/[^0-9]/g, "") })
                    }
                    placeholder="30"
                    style={styles.input}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.col, { maxWidth: 140 }]}>
                  <Text style={styles.label}>Float Hours</Text>
                  <TextInput
                    value={d.floatText}
                    onChangeText={(t) =>
                      setDayPatch(idx, { floatText: t.replace(/[^0-9.]/g, "") })
                    }
                    placeholder="e.g. 1.5"
                    style={styles.input}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>Job Number</Text>
                  <TextInput
                    value={d.jobNumber}
                    onChangeText={(t) => setDayPatch(idx, { jobNumber: t })}
                    placeholder="e.g. 12345-A"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.col, { maxWidth: 180 }]}>
                  <Text style={styles.label}>Total Hours (typed)</Text>
                  <TextInput
                    value={d.totalText}
                    onChangeText={(t) =>
                      setDayPatch(idx, { totalText: t.replace(/[^0-9.]/g, "") })
                    }
                    placeholder="e.g. 8 or 8.5"
                    style={styles.input}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.col, { justifyContent: "flex-end" }]}>
                  <Text style={styles.weekTotalText}>
                    Weekly total so far: {weeklyTypedTotal.toFixed(2)} h
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={() => saveDay(idx)}>
                <Text style={styles.btnTextDark}>Save {d.label}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={[styles.btn, styles.primary]} onPress={saveWeekMeta}>
        <Text style={styles.btnText}>Save Week Details</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.backPrimary, styles.btn]} onPress={() => router.back()}>
        <Text style={styles.btnText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  subtitle: { color: "#6B7280", marginBottom: 10 },
  bold: { fontWeight: "700", color: "#111827" },

  label: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "white",
    borderRadius: 10, padding: 10, minHeight: 44,
  },

  row: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },

  card: {
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12,
    padding: 12, backgroundColor: "white", marginBottom: 10,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  datePill: { backgroundColor: "#F3F4F6", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, fontWeight: "700" },

  weekTotalText: { fontSize: 14, fontWeight: "700", textAlign: "right", paddingTop: 12, color: "#111827" },

  btn: { marginTop: 10, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  primary: { backgroundColor: "#ee1c11ff" },
  secondary: { backgroundColor: "#E5E7EB" },
  btnText: { color: "white", fontWeight: "700" },
  btnTextDark: { color: "#111827", fontWeight: "700" },

  backLink: { alignSelf: "center", marginTop: 16 },
  backPrimary: { backgroundColor: "#ef4444" },
  backText: { color: "#6B7280", textDecorationLine: "underline" },

  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
});
