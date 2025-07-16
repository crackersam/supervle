"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface User {
  id: string;
  forename: string;
  surname: string;
}

interface AssignFormProps {
  students: User[];
  guardians: User[];
  assignGuardian: (
    studentId: string,
    guardianId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AssignForm = ({
  students,
  guardians,
  assignGuardian,
}: AssignFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedGuardian, setSelectedGuardian] = useState<string | null>(null);
  const [studentOpen, setStudentOpen] = useState(false);
  const [guardianOpen, setGuardianOpen] = useState(false);

  const handleAssign = async () => {
    if (!selectedStudent || !selectedGuardian) {
      toast("Error", {
        description: "Please select both student and guardian.",
      });
      return;
    }
    const result = await assignGuardian(selectedStudent, selectedGuardian);
    if (result.success) {
      toast.success("Guardian assigned successfully!");
      setSelectedStudent(null);
      setSelectedGuardian(null);
    } else {
      toast.error(`Error: ${result.error || "Assignment failed."}`);
    }
  };

  const getStudentLabel = (student: User) =>
    `${student.forename} ${student.surname}`.trim();

  const getGuardianLabel = (guardian: User) =>
    `${guardian.forename} ${guardian.surname}`.trim();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Student
        </label>
        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={studentOpen}
              className="w-full justify-between"
            >
              {selectedStudent
                ? getStudentLabel(
                    students.find((s) => s.id === selectedStudent)!
                  )
                : "Select student..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search student..." />
              <CommandEmpty>No student found.</CommandEmpty>
              <CommandGroup>
                {students.map((student) => {
                  const label = getStudentLabel(student);
                  return (
                    <CommandItem
                      key={student.id}
                      value={label}
                      onSelect={(currentValue) => {
                        const selectedId =
                          students.find(
                            (s) =>
                              getStudentLabel(s).toLowerCase() ===
                              currentValue.toLowerCase()
                          )?.id || null;
                        setSelectedStudent(
                          selectedId === selectedStudent ? null : selectedId
                        );
                        setStudentOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedStudent === student.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Guardian
        </label>
        <Popover open={guardianOpen} onOpenChange={setGuardianOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={guardianOpen}
              className="w-full justify-between"
            >
              {selectedGuardian
                ? getGuardianLabel(
                    guardians.find((g) => g.id === selectedGuardian)!
                  )
                : "Select guardian..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search guardian..." />
              <CommandEmpty>No guardian found.</CommandEmpty>
              <CommandGroup>
                {guardians.map((guardian) => {
                  const label = getGuardianLabel(guardian);
                  return (
                    <CommandItem
                      key={guardian.id}
                      value={label}
                      onSelect={(currentValue) => {
                        const selectedId =
                          guardians.find(
                            (g) =>
                              getGuardianLabel(g).toLowerCase() ===
                              currentValue.toLowerCase()
                          )?.id || null;
                        setSelectedGuardian(
                          selectedId === selectedGuardian ? null : selectedId
                        );
                        setGuardianOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedGuardian === guardian.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Button onClick={handleAssign} className="w-full">
        Assign
      </Button>
    </div>
  );
};

export default AssignForm;
