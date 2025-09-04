import bcrypt from "bcryptjs";

const hash = `$2b$10$tCw4vgPAy43lJaETBUY8qebwG7Wb1PwGlM5eDoXAsA8Wt8fTeokYK`
const plain = "password123";

bcrypt.compare(plain, hash).then((result) => {
    console.log("Password match?", result);
});
