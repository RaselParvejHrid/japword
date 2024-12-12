import Link from "next/link";

export default function DashboardPage() {
  const adminRoutes = [
    {
      href: "/admin/lessons",
      label: "Lessons",
    },
    {
      href: "/admin/add-lesson",
      label: "Add New Lesson",
    },
    {
      href: "/admin/add-word",
      label: "Add New Word",
    },
    {
      href: "/admin/users-management",
      label: "Users Management",
    },
    {
      href: "/admin/lessons-management",
      label: "Lessons Management",
    },
    {
      href: "/admin/vocabulary-management",
      label: "Vocabulary Management",
    },
    {
      href: "/admin/tutorials-management",
      label: "Tutorials Management",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {adminRoutes.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-8 text-center px-4 rounded-lg"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
