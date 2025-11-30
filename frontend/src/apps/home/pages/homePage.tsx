import { CreateMoodModal } from "@/apps/moods/components";
import { moods } from "@/apps/moods/data/moods";
import type { MoodTimelineEntry } from "@/apps/moods/services/mood.interface";
import { PRIVATEROUTES } from "@/routes/private.routes";
import useStore from "@/store/useStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AnalyticsSummaryCard,
  HeroTodayCard,
  MonthlyMoodCalendar,
  MoodDonutCard,
  MoodHeatmapBoard,
  MoodTimelineBoard,
  QuickActionsRow,
  TopMoodsBoard,
} from "../components";

const padMonth = (month: number) => String(month).padStart(2, "0");

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const today = new Date();
  const focusMonth = `${today.getFullYear()}-${padMonth(today.getMonth() + 1)}`;

  const { auth } = useStore((state) => state.authState);
  const { analytics, analyticsLoading, loadAnalytics } = useStore(
    (state) => state.moodsState,
  );

  useEffect(() => {
    if (!auth.currentUser?.id) return;
    void loadAnalytics({
      userId: auth.currentUser.id,
      month: focusMonth,
      range: 3,
    });
  }, [auth.currentUser?.id, focusMonth, loadAnalytics]);

  const moodDictionary = useMemo(
    () => new Map(moods.map((item) => [item.moodId, item])),
    [],
  );

  const heroAccent = auth.currentUser?.accentColor ?? "#6366F1";
  const heroAvatar = auth.currentUser?.photoURL ?? null;
  const heroDisplayName =
    auth.currentUser?.name ?? auth.currentUser?.email ?? "Bienvenido";

  const timeline = useMemo<MoodTimelineEntry[]>(() => {
    if (!analytics?.timeline) return [];
    return analytics.timeline.slice(-9).reverse();
  }, [analytics]);

  const heatmapData = useMemo<MoodTimelineEntry[]>(() => {
    if (!analytics?.timeline) return [];
    return analytics.timeline.slice(-24);
  }, [analytics]);

  const timelineMap = useMemo(() => {
    const map = new Map<string, MoodTimelineEntry>();
    analytics?.timeline.forEach((entry) => map.set(entry.date, entry));
    return map;
  }, [analytics]);

  const sentiment = analytics?.sentiment ?? {
    positive: 0,
    neutral: 0,
    negative: 0,
    wellbeingScore: 0,
    riskScore: 0,
  };

  const availableMonths = analytics?.period.months ?? [focusMonth];
  const [selectedMonth, setSelectedMonth] = useState(focusMonth);

  useEffect(() => {
    if (!availableMonths.includes(selectedMonth)) {
      setSelectedMonth(focusMonth);
    }
  }, [availableMonths, focusMonth, selectedMonth]);

  const handleMonthChange = (direction: "prev" | "next") => {
    if (!availableMonths.length) return;
    const index = availableMonths.indexOf(selectedMonth);
    if (index === -1) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
      return;
    }
    if (direction === "prev" && index > 0) {
      setSelectedMonth(availableMonths[index - 1]);
    }
    if (direction === "next" && index < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[index + 1]);
    }
  };

  return (
    <div className="space-y-8 px-2 py-6 md:px-8">
      <section className="grid gap-6 lg:grid-cols-3">

        <HeroTodayCard
          onCreateMood={() => setIsModalOpen(true)}
          analytics={analytics}
          loading={analyticsLoading}
          accentColor={heroAccent}
          avatar={heroAvatar}
          displayName={heroDisplayName}
        />

        <AnalyticsSummaryCard
          analytics={analytics}
          loading={analyticsLoading}
        />

      </section>

      <QuickActionsRow
        onPatients={() => navigate(PRIVATEROUTES.USERS_LIST)}
        onInsights={() => navigate(PRIVATEROUTES.ANALYTICS)}
        onEvents={() => navigate(PRIVATEROUTES.EVENTS)}
        onCalendar={() =>
          calendarRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      />

      <section ref={calendarRef} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyMoodCalendar
            month={selectedMonth}
            timelineMap={timelineMap}
            moodDictionary={moodDictionary}
            onPrev={() => handleMonthChange("prev")}
            onNext={() => handleMonthChange("next")}
          />
        </div>

        <MoodDonutCard sentiment={sentiment} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <MoodTimelineBoard
          timeline={timeline}
          moodDictionary={moodDictionary}
          loading={analyticsLoading}
        />

        <MoodHeatmapBoard data={heatmapData} loading={analyticsLoading} />

        <TopMoodsBoard analytics={analytics} loading={analyticsLoading} />
      </section>

      {isModalOpen && (
        <CreateMoodModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
