"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calculateChange, formatCurrency, hasSufficientPayment, isValidMoneyAmount } from "@/lib/utils/currency";

interface PaymentPanelProps {
  total: number;
  disabled: boolean;
  isSubmitting: boolean;
  onConfirm: (amountReceived: number) => void;
}

export function PaymentPanel({ total, disabled, isSubmitting, onConfirm }: PaymentPanelProps) {
  const [amountReceivedInput, setAmountReceivedInput] = useState("");

  const amountReceived = Number(amountReceivedInput);
  const hasValidAmount = amountReceivedInput.trim() !== "" && isValidMoneyAmount(amountReceived);
  const sufficient = hasValidAmount && hasSufficientPayment(amountReceived, total);
  const change = sufficient ? calculateChange(amountReceived, total) : null;

  const errorMessage = useMemo(() => {
    if (!hasValidAmount || amountReceivedInput.trim() === "") return null;
    if (!sufficient) return "Insufficient payment - amount received is less than the total.";
    return null;
  }, [hasValidAmount, sufficient, amountReceivedInput]);

  const canConfirm = !disabled && !isSubmitting && sufficient && total > 0;

  return (
    <div className="space-y-4 border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between text-lg font-bold text-slate-900">
        <span>TOTAL</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <Input
        id="amount-received"
        label="Cash received"
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        placeholder="0.00"
        value={amountReceivedInput}
        onChange={(event) => setAmountReceivedInput(event.target.value)}
        error={errorMessage ?? undefined}
      />

      <div className="flex items-center justify-between text-base font-semibold text-slate-700">
        <span>CHANGE</span>
        <span>{change !== null ? formatCurrency(change) : "\u2014"}</span>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!canConfirm}
        isLoading={isSubmitting}
        onClick={() => onConfirm(amountReceived)}
      >
        Confirm Payment
      </Button>
    </div>
  );
}
