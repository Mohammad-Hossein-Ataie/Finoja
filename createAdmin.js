const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// اطلاعات ادمین
const username = "madah";
const passwordPlain = "zade"; // رمز قوی بذار!
const role = "admin";

// *** آدرس کانکشن به دیتابیس لیارا ***
const MONGODB_URI = "mongodb://root:FE1r2rodUsZyQ6O0UxDWAGQ7@matterhorn.liara.cloud:32082/my-app?authSource=admin";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: String,
  teacher: mongoose.Schema.Types.ObjectId,
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  // آیا قبلاً کاربر admin وجود دارد؟
  const exists = await User.findOne({ username });
  if (exists) {
    console.log("User 'admin' already exists. Exiting...");
    process.exit(0);
  }
  const password = await bcrypt.hash(passwordPlain, 10);
  await User.create({ username, password, role });
  console.log("Admin user created successfully");
  process.exit(0);
}

main();
