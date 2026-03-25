import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Home,
  LogOut,
  MapPin,
  Pencil,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TripHistory, type TripHistoryEntry } from "./TripHistory";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (username: string) => void;
  onAddressesChanged?: () => void;
}

type Tab = "profile" | "addresses" | "history";

export default function ProfileModal({
  open,
  onClose,
  onSaved,
  onAddressesChanged,
}: ProfileModalProps) {
  const [tab, setTab] = useState<Tab>("profile");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  useEffect(() => {
    if (open) {
      try {
        const u = JSON.parse(localStorage.getItem("quikliv_user") || "{}");
        setUsername(u.username || "");
        setEmail(u.email || "");
      } catch {
        /* ignore */
      }
      setSaved(false);
      loadAddresses();
      setTab("profile");
      setEditingId(null);
    }
  }, [open]);

  function loadAddresses() {
    try {
      const arr = JSON.parse(
        localStorage.getItem("quikliv_saved_addresses") || "[]",
      );
      setAddresses(arr);
    } catch {
      setAddresses([]);
    }
  }

  function persistAddresses(updated: SavedAddress[]) {
    setAddresses(updated);
    localStorage.setItem("quikliv_saved_addresses", JSON.stringify(updated));
    onAddressesChanged?.();
  }

  function deleteAddress(id: string) {
    persistAddresses(addresses.filter((a) => a.id !== id));
  }

  function startEdit(addr: SavedAddress) {
    setEditingId(addr.id);
    setEditLabel(addr.label);
  }

  function saveEdit(id: string) {
    if (!editLabel.trim()) return;
    persistAddresses(
      addresses.map((a) =>
        a.id === id ? { ...a, label: editLabel.trim() } : a,
      ),
    );
    setEditingId(null);
  }

  function handleSave() {
    try {
      const existing = JSON.parse(localStorage.getItem("quikliv_user") || "{}");
      const updated = {
        ...existing,
        username: username.trim(),
        email: email.trim(),
      };
      localStorage.setItem("quikliv_user", JSON.stringify(updated));
      setSaved(true);
      onSaved(username.trim());
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 800);
    } catch {
      /* ignore */
    }
  }

  function handleSignOut() {
    localStorage.removeItem("quikliv_user");
    window.location.reload();
  }

  const initials = username
    ? username
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function labelIcon(label: string) {
    const l = label.toLowerCase();
    if (l === "home") return <Home className="w-3.5 h-3.5" />;
    if (l === "work") return <Briefcase className="w-3.5 h-3.5" />;
    return <MapPin className="w-3.5 h-3.5" />;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden"
        data-ocid="profile.dialog"
      >
        {/* Avatar header */}
        <div className="bg-gradient-to-br from-brand/20 to-brand/5 px-6 pt-8 pb-5 text-center">
          <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-xl font-bold text-primary-foreground">
              {initials}
            </span>
          </div>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              {username || "Your Profile"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              tab === "profile"
                ? "border-b-2 border-brand text-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("addresses");
              loadAddresses();
              setEditingId(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              tab === "addresses"
                ? "border-b-2 border-brand text-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Saved Places
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              tab === "history"
                ? "border-b-2 border-brand text-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            History
          </button>
        </div>

        {tab === "profile" && (
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-username" className="text-xs font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-username"
                  data-ocid="profile.input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 text-sm"
                  placeholder="Your username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-xs font-medium">
                Email
              </Label>
              <Input
                id="profile-email"
                data-ocid="profile.input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
                placeholder="your@email.com"
              />
            </div>

            <Button
              data-ocid="profile.save_button"
              onClick={handleSave}
              disabled={!username.trim()}
              className="w-full bg-brand hover:bg-brand/90 text-primary-foreground font-semibold"
            >
              {saved ? (
                "Saved ✓"
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            <Separator />

            <Button
              data-ocid="profile.delete_button"
              variant="ghost"
              onClick={handleSignOut}
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

        {tab === "addresses" && (
          <div className="px-6 py-5 space-y-3 max-h-80 overflow-y-auto">
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No saved places yet.</p>
                <p className="text-xs mt-1">
                  Use the bookmark icon when entering an address.
                </p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="mt-0.5 text-brand">
                    {labelIcon(addr.label)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === addr.id ? (
                      <div className="flex gap-1.5">
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="h-7 text-xs"
                          placeholder="Label"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(addr.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs bg-brand hover:bg-brand/90 text-primary-foreground"
                          onClick={() => saveEdit(addr.id)}
                          disabled={!editLabel.trim()}
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground capitalize">
                        {addr.label}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {addr.address}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {editingId !== addr.id && (
                      <button
                        type="button"
                        onClick={() => startEdit(addr)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {tab === "history" && (
          <div className="px-6 py-5 max-h-96 overflow-y-auto">
            <TripHistory
              onReRun={(entry: TripHistoryEntry) => {
                onClose();
                // Store re-run data for parent to pick up
                try {
                  localStorage.setItem("quikliv_rerun", JSON.stringify(entry));
                  window.dispatchEvent(
                    new CustomEvent("quikliv_rerun", { detail: entry }),
                  );
                } catch {
                  /* ignore */
                }
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
