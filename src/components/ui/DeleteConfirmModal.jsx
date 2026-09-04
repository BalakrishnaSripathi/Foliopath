import { useState, useCallback, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

export default function DeleteConfirmModal({
  open,
  onOpenChange,
  title = "Delete Item",
  entityName = "",
  entityType = "item",
  description,
  metaFields = [],
  onConfirm,
  errorMessage,
  confirmLabel,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLoading(false);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (errorMessage) setError(errorMessage);
  }, [errorMessage]);

  const handleConfirm = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to delete ${entityType}. Please try again.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [loading, onConfirm, entityType]);

  const handleOpenChange = useCallback(
    (nextOpen) => {
      if (loading) return;
      onOpenChange(nextOpen);
    },
    [loading, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md rounded-2xl p-3"
        showClose={!loading}
      >
        <DialogHeader>
          <div className="mx-auto sm:mx-0 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-[#0B2545]">{title}</DialogTitle>
          <DialogDescription className="text-slate-500">
            {description ||
              `Are you sure you want to delete this ${entityType}? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        {entityName && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#0B2545]">
                {entityName}
              </span>
            </div>
            {metaFields.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {metaFields.map(
                  (field) =>
                    field.value && (
                      <span key={field.label}>
                        <span className="font-medium text-slate-600">
                          {field.label}:
                        </span>{" "}
                        {field.value}
                      </span>
                    )
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <DialogFooter className="gap- sm:gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {confirmLabel ? "Removing..." : "Deleting..."}
              </>
            ) : (
              confirmLabel || "Confirm Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
