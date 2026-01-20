import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useLocation, Link } from "react-router-dom";
import { useMemo } from "react";

// Breadcrumb mapping
const breadcrumbNameMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Nhân viên",
  "/shifts": "Ca làm việc",
  "/shifts/registrations": "Duyệt đăng ký",
  "/attendance": "Chấm công",
  "/tasks": "Công việc",
  "/tasks/review": "Đánh giá checklist",
  "/salaries": "Lương",
  "/reports": "Báo cáo",
  "/settings": "Cài đặt",
  "/settings/roles": "Vai trò",
  "/settings/shift-types": "Loại ca",
};

export default function AppBreadcrumb() {
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);

    const items = [
      {
        title: (
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        ),
      },
    ];

    // Build breadcrumb from path
    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const name = breadcrumbNameMap[url];

      if (name) {
        items.push({
          title:
            index === pathSnippets.length - 1 ? (
              name
            ) : (
              <Link to={url}>{name}</Link>
            ),
        });
      }
    });

    return items;
  }, [location.pathname]);

  // Don't show breadcrumb on dashboard
  if (location.pathname === "/dashboard" || location.pathname === "/") {
    return null;
  }

  return <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />;
}
