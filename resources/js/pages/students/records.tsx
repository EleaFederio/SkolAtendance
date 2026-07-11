import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FileUp, Eye, Pencil, Plus, QrCode, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    imported?: number;
    import_errors?: string[];
};

export default function StudentRecords({ students, imported, import_errors }: Props) {
    const page = usePage();
    const user = page.props.auth?.user;
    const isSuperUser = user?.role === 'super-user';
    const [addOpen, setAddOpen] = useState(false);
    const [viewStudent, setViewStudent] = useState<Student | null>(null);
    const [editStudent, setEditStudent] = useState<Student | null>(null);
    const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
    const [qrStudent, setQrStudent] = useState<Student | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const teamSlug = page.props.currentTeam?.slug ?? '';

    const addForm = useForm({
        first_name: '',
        last_name: '',
        picture: null as File | null,
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
        picture: null as File | null,
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

    const qrForm = useForm({
        qr_code: '',
    });

    const importForm = useForm({
        csv_file: null as File | null,
    });

    const handleAddOpen = () => {
        addForm.reset();
        setAddOpen(true);
    };

    const handleEditOpen = (student: Student) => {
        editForm.setData({
            first_name: student.first_name,
            last_name: student.last_name,
            picture: null,
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

    const handleQrOpen = (student: Student) => {
        qrForm.setData({ qr_code: student.qr_code ?? '' });
        setQrStudent(student);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('first_name', addForm.data.first_name);
        formData.append('last_name', addForm.data.last_name);
        if (addForm.data.picture) {
            formData.append('picture', addForm.data.picture);
        }
        formData.append('middle_initial', addForm.data.middle_initial);
        formData.append('date_of_birth', addForm.data.date_of_birth);
        formData.append('gender', addForm.data.gender);
        formData.append('address', addForm.data.address);
        formData.append('lrn', addForm.data.lrn);
        formData.append('grade_level', addForm.data.grade_level);
        formData.append('section', addForm.data.section);
        formData.append('guardian_name', addForm.data.guardian_name);
        formData.append('guardian_contact_number', addForm.data.guardian_contact_number);
        addForm.post(store.url({ current_team: teamSlug }), {
            forceFormData: true,
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
            forceFormData: true,
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

    const handleQrSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!qrStudent) return;
        const url = `/${teamSlug}/students/${qrStudent.id}/assign-qr`;
        qrForm.post(url, {
            onSuccess: () => {
                setQrStudent(null);
                qrForm.reset();
            },
        });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.csv_file) return;
        importForm.post(`/${teamSlug}/students/import`, {
            forceFormData: true,
            onSuccess: () => {
                setImportOpen(false);
                importForm.reset();
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        importForm.setData('csv_file', file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
            importForm.setData('csv_file', file);
        }
    };

    return (
        <>
            <Head title="Student Records" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Student Records</h1>
                    {isSuperUser && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setImportOpen(true)}>
                                <FileUp className="h-4 w-4" />
                                Import Students
                            </Button>
                            <Button onClick={handleAddOpen}>
                                <Plus className="h-4 w-4" />
                                Add Student
                            </Button>
                        </div>
                    )}
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
                                        <th className="p-3 text-left font-medium">Picture</th>
                                        <th className="p-3 text-left font-medium">Name</th>
                                        <th className="p-3 text-left font-medium">LRN</th>
                                        <th className="p-3 text-left font-medium">Grade</th>
                                        <th className="p-3 text-left font-medium">Section</th>
                                        <th className="p-3 text-left font-medium">Guardian</th>
                                        <th className="p-3 text-right font-medium">
                                            {isSuperUser ? 'Actions' : ''}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id} className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                            <td className="p-3">
                                                {student.picture ? (
                                                    <img
                                                        src={`/storage/${student.picture}`}
                                                        alt={`${student.first_name} ${student.last_name}`}
                                                        className="h-16 w-16 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                                        {student.first_name[0]}{student.last_name[0]}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {student.last_name}, {student.first_name}
                                                {student.middle_initial ? ` ${student.middle_initial}.` : ''}
                                            </td>
                                            <td className="p-3">{student.lrn}</td>
                                            <td className="p-3">{student.grade_level}</td>
                                            <td className="p-3">{student.section}</td>
                                            <td className="p-3">{student.guardian_name}</td>
                                            <td className="p-3 text-right">
                                                {isSuperUser && (
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => setViewStudent(student)}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>View Student</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleQrOpen(student)}
                                                                    >
                                                                        <QrCode className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Assign QR Code</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleEditOpen(student)}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Edit Student</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => setDeleteStudent(student)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Delete Student</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                )}
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
                        <div className="grid gap-2">
                            <Label htmlFor="picture">Picture (Optional)</Label>
                            <Input
                                id="picture"
                                type="file"
                                accept="image/*"
                                onChange={(e) => addForm.setData('picture', e.target.files?.[0] ?? null)}
                            />
                            <InputError message={addForm.errors.picture} />
                        </div>
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
                        {editStudent?.picture && (
                            <div className="grid gap-2">
                                <Label>Current Picture</Label>
                                <img
                                    src={`/storage/${editStudent.picture}`}
                                    alt={`${editStudent.first_name} ${editStudent.last_name}`}
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="edit_picture">Picture (Optional)</Label>
                            <Input
                                id="edit_picture"
                                type="file"
                                accept="image/*"
                                onChange={(e) => editForm.setData('picture', e.target.files?.[0] ?? null)}
                            />
                            <InputError message={editForm.errors.picture} />
                        </div>
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

            <Dialog open={!!qrStudent} onOpenChange={() => setQrStudent(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign QR Code</DialogTitle>
                        <DialogDescription>
                            Enter the unique QR code for {qrStudent?.first_name} {qrStudent?.last_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQrSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="qr_code">QR Code</Label>
                            <Input
                                id="qr_code"
                                name="qr_code"
                                value={qrForm.data.qr_code}
                                onChange={(e) => qrForm.setData('qr_code', e.target.value)}
                                placeholder="Enter unique QR code"
                            />
                            <InputError message={qrForm.errors.qr_code} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setQrStudent(null)}>Cancel</Button>
                            <Button type="submit" disabled={qrForm.processing}>Save QR Code</Button>
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

            <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>
                    {viewStudent && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                {viewStudent.picture ? (
                                    <img
                                        src={`/storage/${viewStudent.picture}`}
                                        alt={`${viewStudent.first_name} ${viewStudent.last_name}`}
                                        className="h-24 w-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-2xl font-medium">
                                        {viewStudent.first_name[0]}{viewStudent.last_name[0]}
                                    </div>
                                )}
                                <div>
                                    <p className="text-lg font-semibold">
                                        {viewStudent.last_name}, {viewStudent.first_name}
                                        {viewStudent.middle_initial ? ` ${viewStudent.middle_initial}.` : ''}
                                    </p>
                                    <p className="text-sm text-muted-foreground">LRN: {viewStudent.lrn}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-muted-foreground">Date of Birth</p>
                                    <p>{new Date(viewStudent.date_of_birth).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Gender</p>
                                    <p>{viewStudent.gender}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Grade Level</p>
                                    <p>{viewStudent.grade_level}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Section</p>
                                    <p>{viewStudent.section}</p>
                                </div>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-muted-foreground">Address</p>
                                <p>{viewStudent.address}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-muted-foreground">Guardian Name</p>
                                    <p>{viewStudent.guardian_name}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Guardian Contact</p>
                                    <p>{viewStudent.guardian_contact_number}</p>
                                </div>
                            </div>
                            {viewStudent.qr_code && (
                                <div className="text-sm">
                                    <p className="font-medium text-muted-foreground">QR Code</p>
                                    <p className="font-mono text-xs">{viewStudent.qr_code}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewStudent(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Import Students</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file to add multiple students at once.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleImportSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>CSV File</Label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                    isDragging
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                                }`}
                            >
                                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                                {importForm.data.csv_file ? (
                                    <p className="text-sm font-medium">{importForm.data.csv_file.name}</p>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium">Drop your CSV file here, or click to browse</p>
                                        <p className="text-xs text-muted-foreground">.csv or .txt files only</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <InputError message={importForm.errors.csv_file} />
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" type="button" onClick={() => {
                                const headers = ['firstName','lastName','middleInitial','dateOfBirth','gender','address','lrn','gradeLevel','section','guardianName','guardianContactNumber'];
                                const csv = headers.join(',') + '\n';
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'student_import_template.csv';
                                a.click();
                                URL.revokeObjectURL(url);
                            }}>
                                Download Template
                            </Button>
                        </div>
                        {import_errors && import_errors.length > 0 && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                <p className="font-medium">Import completed with errors:</p>
                                <ul className="mt-1 list-inside list-disc">
                                    {import_errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                                {imported !== undefined && imported > 0 && (
                                    <p className="mt-1 font-medium">{imported} student(s) imported successfully.</p>
                                )}
                            </div>
                        )}
                        {imported !== undefined && imported > 0 && !import_errors?.length && (
                            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                {imported} student(s) imported successfully.
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => { setImportOpen(false); importForm.reset(); }}>Cancel</Button>
                            <Button type="submit" disabled={!importForm.data.csv_file || importForm.processing}>
                                {importForm.processing ? 'Importing...' : 'Import'}
                            </Button>
                        </DialogFooter>
                    </form>
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
