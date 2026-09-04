import { useState, useEffect } from "react";
import { Search, BookOpen, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

const inputCls =
  "w-full px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:border-[#00A86B] focus:outline-none";

export default function CourseModulePickerModal({
  open,
  onOpenChange,
  courses,
  currentCourseId,
  existingCourseModuleIds,
  onAdd,
  saving,
}) {
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedCourseId(null);
    }
  }, [open]);

  const filteredCourses = courses.filter((c) => {
    if (c.id === currentCourseId) return false;
    if (existingCourseModuleIds.includes(c.id)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.courseCode || "").toLowerCase().includes(q) ||
      (c.shortDescription || "").toLowerCase().includes(q)
    );
  });

  const handleConfirm = () => {
    if (!selectedCourseId) return;
    onAdd(selectedCourseId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl p-0" showClose={!saving}>
        <DialogHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00A86B]/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[#00A86B]" />
            </div>
            <div>
              <DialogTitle className="text-[#0B2545]">
                Add Existing Course as Module
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Select an existing course to reference as a module in this course.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title, code, or description..."
              className={`${inputCls} pl-9`}
              autoFocus
            />
          </div>
        </div>

        <div className="px-5 max-h-72 overflow-y-auto">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              {courses.length <= 1 || filteredCourses.length === 0
                ? "No available courses to add."
                : "No courses match your search."}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredCourses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-150 ${
                    selectedCourseId === c.id
                      ? "border-[#00A86B] bg-[#00A86B]/5 shadow-sm"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-[#0B2545] truncate">
                          {c.title}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded flex-shrink-0 font-mono">
                          {c.courseCode}
                        </span>
                      </div>
                      {c.shortDescription && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {c.shortDescription}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                        c.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : c.status === "DRAFT"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.status || "DRAFT"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-4 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCourseId || saving}
            className="bg-[#00A86B] hover:bg-[#008f5a] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Course as Module"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}