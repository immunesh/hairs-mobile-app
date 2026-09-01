"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getAllStores,
  createStore,
  deleteStore,
} from "@/lib/store-admin-api";

export default function StoresPage() {
  const [stores, setStores] =
    useState<any[]>([]);

  const [form, setForm] =
    useState({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      email: "",
      hours: "",
    });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    const res =
      await getAllStores();

    setStores(res.data || []);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    await createStore(form);

    setForm({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      email: "",
      hours: "",
    });

    loadStores();
  };

  const handleDelete = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Delete store?"
      )
    )
      return;

    await deleteStore(id);

    setStores((prev) =>
      prev.filter(
        (s) => s.id !== id
      )
    );
  };

 return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
          Store Locations
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Manage all physical store locations
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
        Total Stores: {stores.length}
      </div>
    </div>

    {/* Add Store Form */}
    <form
      onSubmit={handleSubmit}
      className="
      rounded-3xl

      bg-white/5
      backdrop-blur-xl

      border
      border-white/10

      p-4 sm:p-6 lg:p-8

      mb-8
      "
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
        Add Store
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <input
          placeholder="Store Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
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

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value,
            })
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
          "
        />

        <input
          placeholder="City"
          value={form.city}
          onChange={(e) =>
            setForm({
              ...form,
              city: e.target.value,
            })
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
          "
        />

        <input
          placeholder="State"
          value={form.state}
          onChange={(e) =>
            setForm({
              ...form,
              state: e.target.value,
            })
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
          "
        />

        <input
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) =>
            setForm({
              ...form,
              pincode: e.target.value,
            })
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
          "
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
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
          "
        />

        <input
          placeholder="Opening Hours"
          value={form.hours}
          onChange={(e) =>
            setForm({
              ...form,
              hours: e.target.value,
            })
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
          "
        />

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
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
          "
        />
      </div>

      <button
        type="submit"
        className="
        mt-6

        w-full
        sm:w-auto

        px-8
        py-3

        rounded-2xl

        bg-gradient-to-r
        from-cyan-500
        to-purple-600

        text-white
        font-medium

        transition-all
        duration-300

        hover:scale-105

        shadow-[0_0_25px_rgba(56,189,248,0.35)]
        "
      >
        Add Store
      </button>
    </form>

    {/* Stores Table */}
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
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Store Name
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                City
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Phone
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="
                  p-8 sm:p-12
                  text-center
                  text-slate-500
                  "
                >
                  No stores found
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr
                  key={store.id}
                  className="
                  border-b
                  border-white/5

                  hover:bg-white/5

                  transition-all
                  duration-300
                  "
                >
                  <td className="p-3 sm:p-5 font-medium text-white">
                    {store.name}
                  </td>

                  <td className="p-3 sm:p-5 text-slate-300">
                    {store.city}
                  </td>

                  <td className="p-3 sm:p-5 text-slate-300">
                    {store.phone}
                  </td>

                  <td className="p-3 sm:p-5">
                    <button
                      onClick={() =>
                        handleDelete(store.id)
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