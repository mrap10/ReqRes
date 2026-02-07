"use client";

import { useEffect, useState } from "react";

export default function TerminalCode() {
  const [displayCode, setDisplayCode] = useState("");
  const codeString = `app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            error: "Missing credentials"
        });
    }

    const user = await db.findUser(email);

    res.status(200).json({
        token: generateToken(user)
    });
})`;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayCode(codeString.slice(0, i));
      i++;
      if (i > codeString.length) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [codeString]);

  return (
    <div className="font-mono text-sm leading-relaxed">
      <pre>
        <code className="language-javascript text-zinc-300">
          {displayCode}
          <span className="animate-pulse text-cyan-400">|</span>
        </code>
      </pre>
    </div>
  );
}
