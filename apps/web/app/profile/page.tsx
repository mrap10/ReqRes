"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "motion/react";
import {
  ProfileCard,
  ActivityGrid,
  QuickStats,
  ProfileActions,
  AvatarPicker,
  DeleteAccountDialog,
} from "@/components/profile/";

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-2xl border border-white/15 bg-[#090910] p-4 sm:p-6"
        >
          <h3 className="text-2xl font-semibold mb-5">Account Overview</h3>
          <ProfileCard />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <ActivityGrid />
            <QuickStats />
          </div>
          <ProfileActions />
        </motion.div>
      </main>

      <Footer />

      <AvatarPicker isOpen={false} />
      <DeleteAccountDialog isOpen={false} />
    </div>
  );
}
