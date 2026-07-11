<?php

namespace App\Enums;

enum Role: string
{
    case SUPER_USER = 'super-user';
    case TEACHER = 'teacher';

    public function label(): string
    {
        return match ($this) {
            self::SUPER_USER => 'Super User',
            self::TEACHER => 'Teacher',
        };
    }

    public function permissions(): array
    {
        return match ($this) {
            self::SUPER_USER => [
                'students.crud',
                'device.configure',
                'attendance.configure',
                'teachers.manage',
            ],
            self::TEACHER => [
                'students.view',
            ],
        };
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions());
    }
}
