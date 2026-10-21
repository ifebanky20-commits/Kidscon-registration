import type { UseFormReturn } from "react-hook-form";
import * as XLSX from "xlsx";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import {
  MAX_STUDENTS,
  type RegistrationForm,
} from "@/schemas/registration";

type StudentImportForm = Pick<
  UseFormReturn<RegistrationForm>,
  "getValues" | "setValue"
>;

export function useStudentImport({ getValues, setValue }: StudentImportForm) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadCount, setUploadCount] = useState<number | null>(null);

  const handleExcelUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploadCount(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target?.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });

        if (rows.length === 0) {
          setUploadError("The file appears to be empty.");
          return;
        }

        const parsed: RegistrationForm["students"] = [];
        const skipped = [];

        rows.forEach((row, i) => {
          const normalised: Record<string, string> = {};
          Object.keys(row).forEach((k) => {
            normalised[k.trim().toLowerCase()] = String(row[k]).trim();
          });

          const name =
            normalised["name"] ||
            normalised["student name"] ||
            normalised["full name"] ||
            "";
          const rawGender = (
            normalised["gender"] ||
            normalised["sex"] ||
            ""
          ).toLowerCase();
          const gender = rawGender.startsWith("f")
            ? "Female"
            : rawGender.startsWith("m")
              ? "Male"
              : "";
          const cls =
            normalised["class"] ||
            normalised["grade"] ||
            normalised["class / grade"] ||
            "";

          if (!name) {
            skipped.push(i + 2);
            return;
          }

          parsed.push({
            name,
            gender: gender || "Male",
            class: cls,
            id: Date.now() + i,
          });
        });

        if (parsed.length === 0) {
          setUploadError(
            'No valid student rows found. Ensure your file has a "Name" column.',
          );
          return;
        }

        const prevStudents = getValues("students");
        const existing = new Set(prevStudents.map((s) => s.name.toLowerCase()));
        const newOnes = parsed.filter(
          (s) => !existing.has(s.name.toLowerCase()),
        );
        const available = MAX_STUDENTS - prevStudents.length;

        if (available <= 0) {
          setUploadError(
            `Maximum of ${MAX_STUDENTS} students reached. No new students were added.`,
          );
          return;
        }

        const trimmed = newOnes.slice(0, available);
        if (trimmed.length < newOnes.length) {
          setUploadError(
            `Only ${trimmed.length} student(s) added — maximum of ${MAX_STUDENTS} students reached.`,
          );
        }

        setValue("students", [...prevStudents, ...trimmed], {
          shouldValidate: true,
        });
        setUploadCount(parsed.length);
        if (skipped.length)
          setUploadError(`${skipped.length} row(s) skipped (missing name).`);
      } catch {
        setUploadError(
          "Could not read the file. Please use a valid .xlsx, .xls, or .csv file.",
        );
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return {
    fileInputRef,
    uploadError,
    setUploadError,
    uploadCount,
    setUploadCount,
    handleExcelUpload,
  };
}
