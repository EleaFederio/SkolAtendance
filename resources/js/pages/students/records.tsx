import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { records, store } from '@/routes/students';
import type { Student } from '@/types';

type Props = {
    students: Student[];
};

export default function StudentRecords({ students }: Props) {
    const page = usePage();
    const [addOpen, setAddOpen] = useState(false);
    const [editStudent, setEditStudent] = useState<Student | null>(null);
    const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

    const teamSlug = page.props.currentTeam?.slug ?? '';

    const addForm = useForm({
        first_name: '',
        last_name: '',
        middle_initial: '',
        date_of_birth: '',
        gender: '',
        address: '',
        lrn: '',
        grade_level: '',
        section: '',
        guardian_name: '',
        guardian_contact_number: '',
    });

    const editForm = useForm({
        first_name: '',
        last_name: '',
        middle_initial: '',
        date_of_birth: '',
        gender: '',
        address: '',
        lrn: '',
        grade_level: '',
        section: '',
        guardian_name: '',
        guardian_contact_number: '',
    });

    const handleAddOpen = () => {
        addForm.reset();
        setAddOpen(true);
    };

    const handleEditOpen = (student: Student) => {
        editForm.setData({
            first_name: student.first_name,
            last_name: student.last_name,
            middle_initial: student.middle_initial ?? '',
            date_of_birth: student.date_of_birth,
            gender: student.gender,
            address: student.address,
            lrn: student.lrn,
            grade_level: student.grade_level,
            section: student.section,
            guardian_name: student.guardian_name,
            guardian_contact_number: student.guardian_contact_number,
        });
        setEditStudent(student);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(store.url({ current_team: teamSlug }), {
            onSuccess: () => {
                setAddOpen(false);
                addForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editStudent) return;
        const url = `/${teamSlug}/students/${editStudent.id}/update`;
        editForm.post(url, {
            onSuccess: () => {
                setEditStudent(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deleteStudent) return;
        router.post(`/${teamSlug}/students/${deleteStudent.id}/destroy`, {}, {
            onSuccess: () => setDeleteStudent(null),
        });
    };

    return (
        <>
            <Head title="Student Records" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Student Records</h1>
                    <Button onClick={handleAddOpen}>
                        <Plus className="h-4 w-4" />
                        Add Student
                    </Button>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {students.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
                            No student records found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                        <th className="p-3 text-left font-medium">Name</th>
                                        <th className="p-3 text-left font-medium">LRN</th>
                                        <th className="p-3 text-left font-medium">Grade</th>
                                        <th className="p-3 text-left font-medium">Section</th>
                                        <th className="p-3 text-left font-medium">Guardian</th>
                                        <th className="p-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id} className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                            <td className="p-3">
                                                {student.last_name}, {student.first_name}
                                                {student.middle_initial ? ` ${student.middle_initial}.` : ''}
                                            </td>
                                            <td className="p-3">{student.lrn}</td>
                                            <td className="p-3">{student.grade_level}</td>
                                            <td className="p-3">{student.section}</td>
                                            <td className="p-3">{student.guardian_name}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditOpen(student)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteStudent(student)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>
                            Fill in the student details below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" name="first_name" value={addForm.data.first_name} onChange={(e) => addForm.setData('first_name', e.target.value)} required placeholder="First name" />
                                <InputError message={addForm.errors.first_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input id="last_name" name="last_name" value={addForm.data.last_name} onChange={(e) => addForm.setData('last_name', e.target.value)} required placeholder="Last name" />
                                <InputError message={addForm.errors.last_name} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="middle_initial">Middle Initial</Label>
                                <Input id="middle_initial" name="middle_initial" value={addForm.data.middle_initial} onChange={(e) => addForm.setData('middle_initial', e.target.value)} placeholder="M" maxLength={10} />
                                <InputError message={addForm.errors.middle_initial} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <Input id="date_of_birth" name="date_of_birth" type="date" value={addForm.data.date_of_birth} onChange={(e) => addForm.setData('date_of_birth', e.target.value)} required />
                                <InputError message={addForm.errors.date_of_birth} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Gender</Label>
                                <Select name="gender" value={addForm.data.gender} onValueChange={(value) => addForm.setData('gender', value)} required>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={addForm.errors.gender} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lrn">LRN</Label>
                                <Input id="lrn" name="lrn" value={addForm.data.lrn} onChange={(e) => addForm.setData('lrn', e.target.value)} required placeholder="Learner Reference Number" />
                                <InputError message={addForm.errors.lrn} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="grade_level">Grade Level</Label>
                                <Input id="grade_level" name="grade_level" value={addForm.data.grade_level} onChange={(e) => addForm.setData('grade_level', e.target.value)} required placeholder="e.g. Grade 10" />
                                <InputError message={addForm.errors.grade_level} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="section">Section</Label>
                                <Input id="section" name="section" value={addForm.data.section} onChange={(e) => addForm.setData('section', e.target.value)} required placeholder="e.g. Section A" />
                                <InputError message={addForm.errors.section} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" value={addForm.data.address} onChange={(e) => addForm.setData('address', e.target.value)} required placeholder="Complete address" />
                            <InputError message={addForm.errors.address} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="guardian_name">Guardian Name</Label>
                                <Input id="guardian_name" name="guardian_name" value={addForm.data.guardian_name} onChange={(e) => addForm.setData('guardian_name', e.target.value)} required placeholder="Guardian full name" />
                                <InputError message={addForm.errors.guardian_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="guardian_contact_number">Guardian Contact</Label>
                                <Input id="guardian_contact_number" name="guardian_contact_number" value={addForm.data.guardian_contact_number} onChange={(e) => addForm.setData('guardian_contact_number', e.target.value)} required placeholder="Contact number" />
                                <InputError message={addForm.errors.guardian_contact_number} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={addForm.processing}>Save Student</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                        <DialogDescription>
                            Update the student details below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_first_name">First Name</Label>
                                <Input id="edit_first_name" name="first_name" value={editForm.data.first_name} onChange={(e) => editForm.setData('first_name', e.target.value)} required />
                                <InputError message={editForm.errors.first_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_last_name">Last Name</Label>
                                <Input id="edit_last_name" name="last_name" value={editForm.data.last_name} onChange={(e) => editForm.setData('last_name', e.target.value)} required />
                                <InputError message={editForm.errors.last_name} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_middle_initial">Middle Initial</Label>
                                <Input id="edit_middle_initial" name="middle_initial" value={editForm.data.middle_initial} onChange={(e) => editForm.setData('middle_initial', e.target.value)} maxLength={10} />
                                <InputError message={editForm.errors.middle_initial} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                                <Input id="edit_date_of_birth" name="date_of_birth" type="date" value={editForm.data.date_of_birth} onChange={(e) => editForm.setData('date_of_birth', e.target.value)} required />
                                <InputError message={editForm.errors.date_of_birth} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Gender</Label>
                                <Select name="gender" value={editForm.data.gender} onValueChange={(value) => editForm.setData('gender', value)} required>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.gender} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_lrn">LRN</Label>
                                <Input id="edit_lrn" name="lrn" value={editForm.data.lrn} onChange={(e) => editForm.setData('lrn', e.target.value)} required />
                                <InputError message={editForm.errors.lrn} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_grade_level">Grade Level</Label>
                                <Input id="edit_grade_level" name="grade_level" value={editForm.data.grade_level} onChange={(e) => editForm.setData('grade_level', e.target.value)} required />
                                <InputError message={editForm.errors.grade_level} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_section">Section</Label>
                                <Input id="edit_section" name="section" value={editForm.data.section} onChange={(e) => editForm.setData('section', e.target.value)} required />
                                <InputError message={editForm.errors.section} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_address">Address</Label>
                            <Input id="edit_address" name="address" value={editForm.data.address} onChange={(e) => editForm.setData('address', e.target.value)} required />
                            <InputError message={editForm.errors.address} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_guardian_name">Guardian Name</Label>
                                <Input id="edit_guardian_name" name="guardian_name" value={editForm.data.guardian_name} onChange={(e) => editForm.setData('guardian_name', e.target.value)} required />
                                <InputError message={editForm.errors.guardian_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_guardian_contact_number">Guardian Contact</Label>
                                <Input id="edit_guardian_contact_number" name="guardian_contact_number" value={editForm.data.guardian_contact_number} onChange={(e) => editForm.setData('guardian_contact_number', e.target.value)} required />
                                <InputError message={editForm.errors.guardian_contact_number} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={editForm.processing}>Update Student</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deleteStudent?.first_name} {deleteStudent?.last_name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteStudent(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

StudentRecords.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/' },
        { title: 'Student Records', href: props.currentTeam ? records(props.currentTeam.slug) : '#' },
    ],
});
