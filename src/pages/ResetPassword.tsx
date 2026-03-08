import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Newspaper, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const passwordRules = [
  { label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);

  const allValid = passwordRules.every((r) => r.test(password));
  const passwordsMatch = password === confirmPw && confirmPw.length > 0;

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) {
      toast.error("Password does not meet all requirements.");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password reset successfully! Please sign in.");
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-foreground">
              <Newspaper className="h-6 w-6 text-background" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-serif">Set New Password</CardTitle>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Choose a strong password for your account
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-body">New Password</Label>
              <Input
                type="password"
                placeholder="Min. 12 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password.length > 0 && (
                <div className="space-y-1 mt-2">
                  {passwordRules.map((rule) => {
                    const valid = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        {valid ? <CheckCircle className="h-3 w-3 text-success" /> : <XCircle className="h-3 w-3 text-destructive" />}
                        <span className={`text-[11px] font-body ${valid ? "text-success" : "text-muted-foreground"}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-body">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
              {confirmPw.length > 0 && !passwordsMatch && (
                <p className="text-[11px] text-destructive font-body">Passwords do not match</p>
              )}
            </div>
            <Button type="submit" className="w-full font-body" disabled={loading || !allValid || !passwordsMatch}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
