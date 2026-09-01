"use client";

import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "@/lib/user-admin-api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredUsers(filtered);
  }, [search, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await getAllUsers();

      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    id: string,
    role: string
  ) => {
    try {
      await updateUserRole(id, role);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? { ...user, role }
            : user
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update role");
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(id);

      setUsers((prev) =>
        prev.filter(
          (user) => user.id !== id
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading users...
      </div>
    );
  }

return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
          User Management
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Manage all registered users
        </p>
      </div>

      <div
        className="
        w-full
        sm:w-auto
        text-center

        px-4 sm:px-5
        py-3

        rounded-2xl

        bg-cyan-500/10
        border
        border-cyan-500/20

        text-cyan-300
        font-medium
        "
      >
        Total Users: {users.length}
      </div>
    </div>

    {/* Search */}
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="
        w-full

        px-4
        py-3

        rounded-2xl

        bg-white/5

        border
        border-white/10

        text-white

        placeholder:text-slate-500

        focus:outline-none
        focus:border-cyan-500/50
        "
      />
    </div>

    {/* Table */}
    <div
      className="
      rounded-3xl

      bg-white/5
      backdrop-blur-xl

      border
      border-white/10

      overflow-hidden
      "
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Name
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Email
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Role
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Joined
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="
                  p-8 sm:p-10
                  text-center
                  text-slate-500
                  "
                >
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="
                  border-b
                  border-white/5

                  hover:bg-white/5

                  transition-all
                  duration-300
                  "
                >
                  {/* Name */}
                  <td className="p-3 sm:p-5">
                    <div className="font-medium text-white">
                      {user.firstName}{" "}
                      {user.lastName}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-3 sm:p-5 text-slate-300">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="p-3 sm:p-5">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value
                        )
                      }
                      className="
                      min-w-[130px]

                      px-3 sm:px-4
                      py-2

                      text-sm

                      rounded-xl

                      bg-[#131827]

                      border
                      border-white/10

                      text-white

                      focus:outline-none
                      focus:border-cyan-500/50
                      "
                    >
                      <option value="CUSTOMER">
                        CUSTOMER
                      </option>

                      <option value="ADMIN">
                        ADMIN
                      </option>
                    </select>
                  </td>

                  {/* Joined */}
                  <td className="p-3 sm:p-5 text-slate-400">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="p-3 sm:p-5">
                    <button
                      onClick={() =>
                        handleDelete(
                          user.id
                        )
                      }
                      className="
                      px-3 sm:px-4
                      py-2

                      text-sm

                      rounded-xl

                      bg-red-500/20
                      border
                      border-red-500/30

                      text-red-300

                      hover:bg-red-500/30
                      hover:text-white

                      transition-all
                      duration-300
                      "
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}