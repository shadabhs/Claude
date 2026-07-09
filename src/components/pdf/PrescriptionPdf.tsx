import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PrescriptionDTO, DoctorProfileDTO } from "@/types/prescription";
import { ageSexLine, formatDate } from "@/lib/format";

const C = {
  primary: "#0f766e",
  dark: "#0f172a",
  muted: "#64748b",
  line: "#cbd5e1",
  lightBg: "#f1f5f9",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontSize: 10,
    color: C.dark,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  clinicName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.primary },
  docName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.dark, marginTop: 2 },
  muted: { color: C.muted },
  headerRight: { textAlign: "right", maxWidth: 200 },
  rule: { borderBottomWidth: 1.5, borderBottomColor: C.primary, marginTop: 10, marginBottom: 12 },
  patientRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { color: C.muted, fontSize: 9 },
  value: { fontFamily: "Helvetica-Bold" },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  rxSymbol: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.primary, marginBottom: 4 },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.lightBg,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  th: { fontSize: 8.5, color: C.muted, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  cNo: { width: "6%" },
  cName: { width: "34%" },
  cDose: { width: "16%" },
  cFreq: { width: "16%" },
  cDur: { width: "16%" },
  cInstr: { width: "12%" },
  medName: { fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: C.line,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: C.muted,
  },
  signature: { marginTop: 30, alignItems: "flex-end" },
  sigLine: { width: 160, borderTopWidth: 0.5, borderTopColor: C.dark, paddingTop: 3, textAlign: "center" },
});

function vitalsList(rx: PrescriptionDTO): string[] {
  const v: string[] = [];
  if (rx.bpSystolic != null || rx.bpDiastolic != null) {
    v.push(`BP ${rx.bpSystolic ?? "–"}/${rx.bpDiastolic ?? "–"} mmHg`);
  }
  if (rx.pulse != null) v.push(`Pulse ${rx.pulse} bpm`);
  if (rx.spo2 != null) v.push(`SpO2 ${rx.spo2}%`);
  if (rx.weightKg != null) v.push(`Wt ${rx.weightKg} kg`);
  if (rx.temperatureC != null) v.push(`Temp ${rx.temperatureC} °C`);
  if (rx.vitalsOther) v.push(rx.vitalsOther);
  return v;
}

export function PrescriptionPdf({
  rx,
  profile,
}: {
  rx: PrescriptionDTO;
  profile: DoctorProfileDTO;
}) {
  const vitals = vitalsList(rx);
  const patientSub = ageSexLine(rx.patient.ageYears, rx.patient.sex);

  return (
    <Document
      title={`Rx-${rx.patient.name}-${formatDate(rx.date)}`}
      author={profile.displayName}
    >
      <Page size="A4" style={styles.page}>
        {/* Letterhead */}
        <View style={styles.header}>
          <View>
            {profile.clinicName ? (
              <Text style={styles.clinicName}>{profile.clinicName}</Text>
            ) : null}
            <Text style={styles.docName}>{profile.displayName}</Text>
            {profile.qualifications ? (
              <Text style={styles.muted}>{profile.qualifications}</Text>
            ) : null}
            {profile.registrationNo ? (
              <Text style={styles.muted}>Reg. No: {profile.registrationNo}</Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            {profile.clinicAddress ? (
              <Text style={styles.muted}>{profile.clinicAddress}</Text>
            ) : null}
            {profile.phone ? (
              <Text style={styles.muted}>{profile.phone}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rule} />

        {/* Patient + date */}
        <View style={styles.patientRow}>
          <View>
            <Text style={styles.label}>Patient</Text>
            <Text style={styles.value}>
              {rx.patient.name}
              {patientSub ? `  (${patientSub})` : ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(rx.date)}</Text>
          </View>
        </View>

        {/* Vitals */}
        {vitals.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vitals</Text>
            <Text>{vitals.join("   •   ")}</Text>
          </View>
        ) : null}

        {/* Diagnosis */}
        {rx.diagnosis ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diagnosis</Text>
            <Text>{rx.diagnosis}</Text>
          </View>
        ) : null}

        {/* Rx / medicines */}
        <View style={styles.section}>
          <Text style={styles.rxSymbol}>Rx</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.cNo]}>#</Text>
            <Text style={[styles.th, styles.cName]}>Medicine</Text>
            <Text style={[styles.th, styles.cDose]}>Dose</Text>
            <Text style={[styles.th, styles.cFreq]}>Frequency</Text>
            <Text style={[styles.th, styles.cDur]}>Duration</Text>
            <Text style={[styles.th, styles.cInstr]}>Notes</Text>
          </View>
          {rx.medicines.map((m, i) => (
            <View key={m.id} style={styles.tableRow} wrap={false}>
              <Text style={styles.cNo}>{i + 1}</Text>
              <View style={styles.cName}>
                <Text style={styles.medName}>{m.name}</Text>
                {m.instructions ? (
                  <Text style={[styles.muted, { fontSize: 8.5 }]}>
                    {m.instructions}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.cDose}>{m.dose || "–"}</Text>
              <Text style={styles.cFreq}>{m.frequency || "–"}</Text>
              <Text style={styles.cDur}>{m.duration || "–"}</Text>
              <Text style={styles.cInstr}>{m.instructions ? "" : "–"}</Text>
            </View>
          ))}
        </View>

        {/* Advice */}
        {rx.advice ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advice</Text>
            <Text>{rx.advice}</Text>
          </View>
        ) : null}

        {/* Follow-up */}
        {rx.followUpDate ? (
          <View style={styles.section}>
            <Text>
              <Text style={styles.value}>Follow-up: </Text>
              {formatDate(rx.followUpDate)}
            </Text>
          </View>
        ) : null}

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.sigLine}>{profile.displayName}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{profile.footerNote ?? ""}</Text>
          <Text>
            Generated {formatDate(new Date())} · Not valid without signature
          </Text>
        </View>
      </Page>
    </Document>
  );
}
