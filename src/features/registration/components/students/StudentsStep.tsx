import { AlertCircle, FileCheck, Plus, Trash2, Upload } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { AddStudentModal } from "@/features/registration/components/students/AddStudentModal";
import { useRegistrationStudents } from "@/features/registration/components/students/useRegistrationStudents";
import { useStudentImport } from "@/features/registration/components/students/useStudentImport";
import {
  MAX_STUDENTS,
  type RegistrationForm,
} from "@/schemas/registration";
import { Button } from "@/shared/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/Table";

export function StudentsStep() {
  const form = useFormContext<RegistrationForm>();
  const { fileInputRef, handleExcelUpload, uploadError, setUploadError, uploadCount, setUploadCount } = useStudentImport(form);
  const { studentFields, removeStudent, isAtStudentLimit, isStudentModalOpen, setIsStudentModalOpen,
    newStudent, setNewStudent, handleAddStudent } = useRegistrationStudents(form.control);
  return (
    <div
      key="step2"
      className="motion-safe:animate-enter [--enter-x:1.25rem] [--enter-blur:4px] duration-[450ms] space-y-6"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleExcelUpload}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-wash p-4 rounded-2xl">
        <div className="ml-2">
          <p className="text-brand-muted font-medium">
            Total Students:{" "}
            <span
              className={`font-bold text-2xl ml-2 ${isAtStudentLimit ? "text-md-error" : "text-brand-primary"}`}
            >
              {studentFields.length}
            </span>
            <span className="text-brand-muted/60 text-base font-medium">
              {" "}
              / {MAX_STUDENTS}
            </span>
          </p>
          {isAtStudentLimit && (
            <p className="text-xs font-semibold text-md-error mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> Maximum of {MAX_STUDENTS} students
              reached
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className=" gap-2  rounded-xl"
            disabled={isAtStudentLimit}
            onClick={() => {
              setUploadError("");
              setUploadCount(null);
              fileInputRef.current?.click();
            }}
          >
            <Upload size={18} /> Upload Excel
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsStudentModalOpen(true)}
            disabled={isAtStudentLimit}
            className="gap-2 flex-1 rounded-xl shadow-none"
          >
            <Plus size={18} /> Add Student
          </Button>
        </div>
      </div>

      {isAtStudentLimit && (
        <div className="flex items-center gap-2 bg-md-error/10 text-md-error p-3 rounded-xl text-sm font-semibold">
          <AlertCircle size={16} /> You've reached the maximum of {MAX_STUDENTS}{" "}
          students allowed per registration.
        </div>
      )}

      {uploadCount !== null && !uploadError && (
        <div className="flex items-center gap-2 bg-brand-wash text-brand-primary p-3 rounded-xl text-sm font-semibold">
          <FileCheck size={16} /> {uploadCount} student
          {uploadCount !== 1 ? "s" : ""} imported successfully.
        </div>
      )}
      {uploadError && (
        <div className="flex items-center gap-2 bg-md-error/10 text-md-error p-3 rounded-xl text-sm font-semibold">
          <AlertCircle size={16} /> {uploadError}
        </div>
      )}

      {studentFields.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-brand-line rounded-2xl bg-brand-surface">
          <p className="text-brand-muted text-lg">No students added yet.</p>
          <Button
            variant="ghost"
            className="mt-4 gap-2 text-brand-primary"
            onClick={() => setIsStudentModalOpen(true)}
          >
            <Plus size={18} /> Add your first student
          </Button>
        </div>
      ) : (
        <Table className="rounded-2xl overflow-hidden">
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="w-[80px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentFields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="font-medium text-brand-ink">
                  {field.name}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${field.gender === "Female"
                        ? "bg-[#FFDEB6] text-[#653207]"
                        : "bg-brand-tint text-brand-primary"
                      }`}
                  >
                    {field.gender}
                  </span>
                </TableCell>
                <TableCell className="text-brand-muted font-medium">
                  {field.class}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    aria-label={`Remove ${field.name}`}
                    onClick={() => removeStudent(index)}
                    className="text-brand-muted hover:text-md-error hover:bg-md-error/10 transition-colors p-2 rounded-full active:scale-95"
                  >
                    <Trash2 size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <AddStudentModal
        isStudentModalOpen={isStudentModalOpen}
        setIsStudentModalOpen={setIsStudentModalOpen}
        newStudent={newStudent}
        setNewStudent={setNewStudent}
        handleAddStudent={handleAddStudent}
      />
    </div>
  );
}
