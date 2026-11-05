/**
 * Non-destructive demo seed: creates staff, services and sample history
 * only when they don't exist yet.  Run with `npm run seed`.
 *
 * Demo accounts (password for all: Empire2026)
 *   owner@lempire.test   — propriétaire
 *   manager@lempire.test — manager
 *   karim@lempire.test, yanis@lempire.test, sami@lempire.test — barbers
 *   client@lempire.test  — client
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/user.model.js";
import { Service } from "../models/service.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Prestation } from "../models/prestation.model.js";
import { Review } from "../models/review.model.js";
import type { Role } from "../types/user.js";

const PASSWORD = "Empire2026";

const people: {
  email: string;
  username: string;
  role: Role;
  bio?: string;
  specialties?: string[];
}[] = [
  { email: "owner@lempire.test", username: "Adam Empire", role: "owner" },
  { email: "manager@lempire.test", username: "Nadia Manager", role: "manager" },
  {
    email: "karim@lempire.test",
    username: "Karim",
    role: "barber",
    bio: "Maître du dégradé, 10 ans de ciseaux et de tondeuse.",
    specialties: ["Dégradé", "Taper", "Barbe"],
  },
  {
    email: "yanis@lempire.test",
    username: "Yanis",
    role: "barber",
    bio: "Coupes texturées et styles modernes.",
    specialties: ["Crop", "Texturé", "Couleur"],
  },
  {
    email: "sami@lempire.test",
    username: "Sami",
    role: "barber",
    bio: "Rasage traditionnel à la serviette chaude.",
    specialties: ["Rasage", "Barbe", "Classique"],
  },
  { email: "client@lempire.test", username: "Youssef", role: "client" },
  { email: "client2@lempire.test", username: "Mehdi", role: "client" },
];

const services = [
  { name: "Coupe Classique", category: "Coupe", price: 800, duration: 30, description: "Coupe aux ciseaux et tondeuse, shampoing inclus." },
  { name: "Dégradé Impérial", category: "Coupe", price: 1200, duration: 45, description: "Dégradé net à la lame, finitions au rasoir." },
  { name: "Taille de Barbe", category: "Barbe", price: 500, duration: 20, description: "Contours précis, huile et baume." },
  { name: "Rasage Royal", category: "Barbe", price: 800, duration: 30, description: "Rasage traditionnel à la serviette chaude." },
  { name: "Coupe + Barbe", category: "Formule", price: 1500, duration: 60, description: "La formule complète de l'Empire." },
  { name: "Coupe Enfant", category: "Coupe", price: 500, duration: 25, description: "Pour les moins de 12 ans." },
];

async function seed() {
  await connectDB();

  const users: Record<string, InstanceType<typeof User>> = {};
  for (const p of people) {
    let user = await User.findOne({ email: p.email });
    if (!user) user = await User.create({ ...p, password: PASSWORD });
    users[p.email] = user;
  }

  const serviceDocs = [];
  for (const s of services) {
    let doc = await Service.findOne({ name: s.name });
    if (!doc) doc = await Service.create(s);
    else if (doc.price < 100) {
      // old euro-priced demo service: convert to its DZD price
      doc.price = s.price;
      await doc.save();
    }
    serviceDocs.push(doc);
  }

  if ((await Prestation.countDocuments()) === 0) {
    const barbers = ["karim", "yanis", "sami"].map(
      (n) => users[`${n}@lempire.test`]!,
    );
    const clients = [users["client@lempire.test"]!, users["client2@lempire.test"]!];
    const cutTypes = ["Dégradé", "Crop", "Barbe", "Classique"];

    // ~40 past visits over the last 30 days
    for (let i = 0; i < 40; i++) {
      const barber = barbers[i % barbers.length]!;
      const client = clients[i % clients.length]!;
      const service = serviceDocs[i % serviceDocs.length]!;
      const start = new Date();
      start.setDate(start.getDate() - Math.floor(Math.random() * 30) - 1);
      start.setHours(9 + (i % 9), i % 2 ? 30 : 0, 0, 0);
      const appt = await Appointment.create({
        client: client._id,
        barber: barber._id,
        service: service._id,
        start,
        end: new Date(start.getTime() + service.duration * 60_000),
        price: service.price,
        status: "completed",
        reminderSent: true,
        reviewed: i % 3 === 0,
      });
      await Prestation.create({
        appointment: appt._id,
        client: client._id,
        barber: barber._id,
        service: service._id,
        price: service.price,
        date: start,
        cutType: cutTypes[i % cutTypes.length]!,
        notes: "Sabot 2 sur les côtés, 4 cm sur le dessus.",
        source: "appointment",
        paymentMethod: i % 4 === 0 ? "card" : "cash",
      });
      if (appt.reviewed) {
        await Review.create({
          client: client._id,
          barber: barber._id,
          appointment: appt._id,
          rating: 4 + (i % 2),
          comment: ["Travail impeccable, je recommande !", "Toujours au top, merci.", "Super ambiance et coupe parfaite."][(i / 3) % 3]!,
        });
      }
    }
    console.log("Sample history created");
  }

  console.log(`Seed complete. Demo password: ${PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
