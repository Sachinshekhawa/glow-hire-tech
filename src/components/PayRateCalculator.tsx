import { useEffect, useMemo, useState } from "react";
import { Calculator, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "CAD", "AUD", "SGD", "AED", "JPY", "CHF", "MXN", "BRL", "ZAR",
];

type Props = {
  initialBillRate?: number;
  initialBillCurrency?: string;
  initialPayCurrency?: string;
  className?: string;
  compact?: boolean;
};

const fmt = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
};

const PayRateCalculator = ({
  initialBillRate = 100,
  initialBillCurrency = "USD",
  initialPayCurrency = "USD",
  className,
  compact,
}: Props) => {
  const { toast } = useToast();
  const [billRate, setBillRate] = useState<number>(initialBillRate);
  const [billCurrency, setBillCurrency] = useState<string>(initialBillCurrency);
  const [payCurrency, setPayCurrency] = useState<string>(initialPayCurrency);

  // Breakdown % of bill rate
  const [employerTax, setEmployerTax] = useState<number>(9); // FICA/social etc.
  const [benefits, setBenefits] = useState<number>(6);
  const [overhead, setOverhead] = useState<number>(5);
  const [margin, setMargin] = useState<number>(20);

  const [fxRate, setFxRate] = useState<number>(1);
  const [fxDate, setFxDate] = useState<string>("");
  const [fxLoading, setFxLoading] = useState<boolean>(false);

  const fetchRate = async () => {
    if (billCurrency === payCurrency) {
      setFxRate(1);
      setFxDate(new Date().toISOString().slice(0, 10));
      return;
    }
    setFxLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fx-rate?from=${billCurrency}&to=${payCurrency}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "FX error");
      setFxRate(j.rate);
      setFxDate(j.date);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Couldn't fetch live rate",
        description: e.message || "Falling back to 1.0",
      });
      setFxRate(1);
    } finally {
      setFxLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billCurrency, payCurrency]);

  const breakdown = useMemo(() => {
    const bill = Number(billRate) || 0;
    const totalCostPct = employerTax + benefits + overhead + margin;
    const payRateBill = bill * (1 - totalCostPct / 100);
    const employerTaxAmt = bill * (employerTax / 100);
    const benefitsAmt = bill * (benefits / 100);
    const overheadAmt = bill * (overhead / 100);
    const marginAmt = bill * (margin / 100);
    const payRatePay = payRateBill * fxRate;
    return {
      bill,
      employerTaxAmt,
      benefitsAmt,
      overheadAmt,
      marginAmt,
      payRateBill,
      payRatePay,
      totalCostPct,
      valid: totalCostPct < 100 && bill > 0,
    };
  }, [billRate, employerTax, benefits, overhead, margin, fxRate]);

  return (
    <Card className={className}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-primary" />
              Bill → Pay rate calculator
            </CardTitle>
            <CardDescription>
              Deduct employer costs, benefits, overhead & margin, then convert to candidate's currency.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Bill rate + currencies */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2 sm:col-span-2">
            <Label className="text-xs">Client bill rate (per hr)</Label>
            <Input
              type="number"
              min={0}
              value={billRate}
              onChange={(e) => setBillRate(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label className="text-xs">Bill currency</Label>
            <Select value={billCurrency} onValueChange={setBillCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Pay currency</Label>
            <Select value={payCurrency} onValueChange={setPayCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {[
            { label: "Employer taxes", val: employerTax, set: setEmployerTax, max: 30 },
            { label: "Benefits (health, PTO)", val: benefits, set: setBenefits, max: 30 },
            { label: "Overhead", val: overhead, set: setOverhead, max: 30 },
            { label: "Company margin", val: margin, set: setMargin, max: 60 },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium tabular-nums">{row.val}%</span>
              </div>
              <Slider
                value={[row.val]}
                onValueChange={(v) => row.set(v[0])}
                min={0}
                max={row.max}
                step={0.5}
              />
            </div>
          ))}
        </div>

        {/* FX line */}
        <div className="flex items-center justify-between rounded-md border border-dashed p-3 text-xs">
          <div>
            <p className="font-medium">
              1 {billCurrency} = {fxRate.toFixed(4)} {payCurrency}
            </p>
            <p className="text-muted-foreground">
              {billCurrency === payCurrency ? "Same currency" : `Live ECB rate · ${fxDate || "—"}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRate}
            disabled={fxLoading || billCurrency === payCurrency}
          >
            {fxLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        </div>

        {/* Breakdown */}
        <div className="rounded-lg bg-muted/40 p-4 space-y-2 text-sm">
          <Row label={`Bill rate`} value={fmt(breakdown.bill, billCurrency)} />
          <Row label={`Employer taxes (${employerTax}%)`} value={`− ${fmt(breakdown.employerTaxAmt, billCurrency)}`} muted />
          <Row label={`Benefits (${benefits}%)`} value={`− ${fmt(breakdown.benefitsAmt, billCurrency)}`} muted />
          <Row label={`Overhead (${overhead}%)`} value={`− ${fmt(breakdown.overheadAmt, billCurrency)}`} muted />
          <Row label={`Company margin (${margin}%)`} value={`− ${fmt(breakdown.marginAmt, billCurrency)}`} muted />
          <div className="border-t pt-2 mt-2 space-y-1.5">
            <Row
              label={`Candidate pay rate (${billCurrency})`}
              value={fmt(breakdown.payRateBill, billCurrency)}
              bold
            />
            {billCurrency !== payCurrency && (
              <Row
                label={`Candidate pay rate (${payCurrency})`}
                value={fmt(breakdown.payRatePay, payCurrency)}
                bold
                highlight
              />
            )}
          </div>
          {!breakdown.valid && (
            <p className="text-xs text-destructive pt-2">
              Total deductions exceed 100% — adjust your inputs.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Row = ({
  label,
  value,
  muted,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) => (
  <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
    <span>{label}</span>
    <span
      className={`tabular-nums ${bold ? "font-semibold" : ""} ${highlight ? "text-primary" : ""}`}
    >
      {value}
    </span>
  </div>
);

export default PayRateCalculator;
