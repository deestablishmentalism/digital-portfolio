import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    // Guard against accidental double-hashing:
    // If the password is already a valid bcrypt hash, do not hash it again.
    const isAlreadyBcryptHash =
        typeof this.password === "string" &&
        /^\$2[abxy]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.password);

    if (isAlreadyBcryptHash) return;

    this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model("User", userSchema);


