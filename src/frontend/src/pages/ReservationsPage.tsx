import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Phone,
  User,
  Users,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useCreateReservation } from "../hooks/useQueries";

const TIME_SLOTS = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];

const PARTY_SIZES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

type FormData = {
  guestName: string;
  date: string;
  time: string;
  partySize: string;
  phone: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.guestName.trim()) errors.guestName = "Please enter your name";
  if (!data.date) errors.date = "Please select a date";
  else {
    const selected = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) errors.date = "Date must be today or in the future";
  }
  if (!data.time) errors.time = "Please select a time";
  if (!data.partySize) errors.partySize = "Please select party size";
  if (!data.phone.trim()) errors.phone = "Please enter your phone number";
  else if (!/^\+?[\d\s\-()]{7,15}$/.test(data.phone.trim()))
    errors.phone = "Enter a valid phone number";
  return errors;
}

export default function ReservationsPage() {
  const [form, setForm] = useState<FormData>({
    guestName: "",
    date: "",
    time: "",
    partySize: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { mutateAsync: createReservation, isPending } = useCreateReservation();

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus first error
      const firstErrorKey = Object.keys(newErrors)[0] as keyof FormData;
      const el = document.querySelector(
        `[data-ocid="reservation.${firstErrorKey}_input"]`,
      );
      (el as HTMLElement)?.focus();
      return;
    }

    setSubmitError("");
    try {
      const partySizeNum = Number.parseInt(
        form.partySize === "10+" ? "10" : form.partySize,
        10,
      );
      await createReservation({
        guestName: form.guestName,
        date: form.date,
        time: form.time,
        partySize: BigInt(partySizeNum),
        phone: form.phone,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError("Failed to submit reservation. Please try again.");
      console.error(err);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <motion.div
          data-ocid="reservation.success_state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display font-bold text-3xl text-foreground mb-3">
            Reservation Confirmed!
          </h2>
          <p className="font-ui text-muted-foreground mb-2">
            Thank you,{" "}
            <strong className="text-foreground">{form.guestName}</strong>!
          </p>
          <p className="font-ui text-muted-foreground mb-8">
            Your table for{" "}
            <strong className="text-foreground">{form.partySize}</strong> guests
            on <strong className="text-foreground">{form.date}</strong> at{" "}
            <strong className="text-foreground">{form.time}</strong> has been
            reserved. We&apos;ll confirm via call at{" "}
            <strong className="text-foreground">{form.phone}</strong>.
          </p>
          <p className="font-ui text-sm text-muted-foreground bg-muted rounded-lg px-4 py-3 mb-8">
            📞 Our team will call you 2 hours before your reservation to
            confirm.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setForm({
                guestName: "",
                date: "",
                time: "",
                partySize: "",
                phone: "",
              });
            }}
            variant="outline"
            className="font-ui border-primary/40 text-primary hover:bg-primary/10"
          >
            Make Another Reservation
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-card border-b border-border py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 spice-pattern pointer-events-none" />
        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-ui text-xs text-primary tracking-widest uppercase font-semibold mb-3">
              Join Us
            </p>
            <h1 className="font-display font-black text-5xl md:text-6xl text-foreground mb-4">
              Book a <span className="text-gold-gradient">Table</span>
            </h1>
            <div className="ornament-divider max-w-xs mx-auto">
              <span className="text-primary text-lg">✦</span>
            </div>
            <p className="font-ui text-muted-foreground mt-5 max-w-lg mx-auto">
              Reserve your spot and let us prepare an unforgettable dining
              experience for you and your guests.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-20">
        <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 md:p-10"
          >
            <h2 className="font-display font-bold text-2xl text-foreground mb-8">
              Reservation Details
            </h2>

            {submitError && (
              <Alert
                data-ocid="reservation.error_state"
                variant="destructive"
                className="mb-6"
              >
                <AlertDescription className="font-ui">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Guest Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="guestName"
                  className="font-ui font-medium text-foreground flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-primary" />
                  Guest Name
                </Label>
                <Input
                  id="guestName"
                  data-ocid="reservation.input"
                  name="guestName"
                  placeholder="e.g. Priya Sharma"
                  value={form.guestName}
                  onChange={(e) => handleChange("guestName", e.target.value)}
                  className={`font-ui bg-background border-border focus:border-primary ${errors.guestName ? "border-destructive" : ""}`}
                  autoComplete="name"
                />
                {errors.guestName && (
                  <p className="font-ui text-xs text-destructive">
                    {errors.guestName}
                  </p>
                )}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="font-ui font-medium text-foreground flex items-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    data-ocid="reservation.input"
                    name="date"
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className={`font-ui bg-background border-border focus:border-primary ${errors.date ? "border-destructive" : ""}`}
                  />
                  {errors.date && (
                    <p className="font-ui text-xs text-destructive">
                      {errors.date}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="time"
                    className="font-ui font-medium text-foreground flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-primary" />
                    Time
                  </Label>
                  <Select
                    value={form.time}
                    onValueChange={(v) => handleChange("time", v)}
                  >
                    <SelectTrigger
                      id="time"
                      data-ocid="reservation.input"
                      className={`font-ui bg-background border-border ${errors.time ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((t) => (
                        <SelectItem key={t} value={t} className="font-ui">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.time && (
                    <p className="font-ui text-xs text-destructive">
                      {errors.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Party Size + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="partySize"
                    className="font-ui font-medium text-foreground flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-primary" />
                    Party Size
                  </Label>
                  <Select
                    value={form.partySize}
                    onValueChange={(v) => handleChange("partySize", v)}
                  >
                    <SelectTrigger
                      id="partySize"
                      data-ocid="reservation.input"
                      className={`font-ui bg-background border-border ${errors.partySize ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTY_SIZES.map((s) => (
                        <SelectItem key={s} value={s} className="font-ui">
                          {s} {s === "1" ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.partySize && (
                    <p className="font-ui text-xs text-destructive">
                      {errors.partySize}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="font-ui font-medium text-foreground flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    data-ocid="reservation.input"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`font-ui bg-background border-border focus:border-primary ${errors.phone ? "border-destructive" : ""}`}
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p className="font-ui text-xs text-destructive">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                data-ocid="reservation.submit_button"
                disabled={isPending}
                className="w-full font-ui font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 py-6 text-base"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming your reservation...
                  </>
                ) : (
                  "Confirm Reservation"
                )}
              </Button>

              <p className="font-ui text-xs text-muted-foreground text-center">
                By reserving, you agree to our cancellation policy. Reservations
                held for 15 minutes past the booking time.
              </p>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
