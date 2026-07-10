export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                <img src="/images/school_logo.png" alt="CFNHS Logo" className="size-8 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 whitespace-pre-line leading-tight font-semibold">
                    {'CFNHS Student\nAttendance\nSystem'}
                </span>
            </div>
        </>
    );
}
