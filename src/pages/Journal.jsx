import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import moment from "moment";
import MoodChart from "@/components/journal/MoodChart";

const MOODS = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "low", emoji: "😔", label: "Low" },
  { value: "rough", emoji: "😢", label: "Rough" },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", content: "", mood: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    const data = await base44.entities.JournalEntry.list("-created_date", 100);
    // Filter entries older than 45 days
    const cutoff = moment().subtract(45, "days");
    const valid = data.filter((e) => moment(e.created_date).isAfter(cutoff));
    setEntries(valid);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newEntry.content.trim()) return;
    setSaving(true);
    await base44.entities.JournalEntry.create(newEntry);
    setSaving(false);
    setWriting(false);
    setNewEntry({ title: "", content: "", mood: "" });
    loadEntries();
  };

  const handleDelete = async (id) => {
    await base44.entities.JournalEntry.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDownload = () => {
    const text = entries.map((e) =>
      `${moment(e.created_date).format("MMMM D, YYYY h:mm A")}\n${e.title ? `Title: ${e.title}\n` : ""}${e.mood ? `Mood: ${MOODS.find(m => m.value === e.mood)?.label || e.mood}\n` : ""}\n${e.content}\n\n---\n`
    ).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kalise-journal-${moment().format("YYYY-MM-DD")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (writing) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <button onClick={() => setWriting(false)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="font-heading text-xl font-semibold mb-4">New Entry</h2>
        
        <div className="space-y-4">
          <Input
            placeholder="Title (optional)"
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
          />
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">How are you feeling?</p>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setNewEntry({ ...newEntry, mood: m.value })}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    newEntry.mood === m.value ? "bg-primary/10 border-primary" : "bg-secondary"
                  } border border-transparent`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[10px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            placeholder="What's on your mind? Just write..."
            className="min-h-[200px] text-sm leading-relaxed resize-none"
            autoFocus
          />

          <Button onClick={handleSave} disabled={!newEntry.content.trim() || saving} className="w-full h-12">
            {saving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Journal</h1>
          <p className="text-xs text-muted-foreground">Entries stored for 45 days</p>
        </div>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleDownload} title="Download all">
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button size="icon" onClick={() => setWriting(true)} className="rounded-xl">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!loading && <MoodChart entries={entries} />}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-muted-foreground text-sm">Your journal is empty.</p>
          <p className="text-muted-foreground text-xs mt-1">Start writing — no one's reading but you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="p-4 rounded-2xl border border-border/50 bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {entry.title && <h3 className="font-semibold text-sm">{entry.title}</h3>}
                  <p className="text-xs text-muted-foreground">{moment(entry.created_date).format("MMM D, YYYY · h:mm A")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.mood && <span className="text-lg">{MOODS.find((m) => m.value === entry.mood)?.emoji}</span>}
                  <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}