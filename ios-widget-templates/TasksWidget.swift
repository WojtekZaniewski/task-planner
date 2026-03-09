// TasksWidget.swift
// Add this file to the WidgetKit extension target in Xcode:
//   File → New → Target → Widget Extension → name: TasksWidget
//
// Replace YOUR_SUPABASE_URL and YOUR_ANON_KEY with values from
// your Supabase project settings → API.
//
// Add App Group capability to BOTH the main app target and this widget target:
//   Signing & Capabilities → + Capability → App Groups → group.com.yourname.tasks

import WidgetKit
import SwiftUI

private let supabaseURL = "https://YOUR_SUPABASE_URL.supabase.co"
private let supabaseAnonKey = "YOUR_ANON_KEY"
private let appGroup = "group.com.yourname.tasks"

struct TaskEntry: TimelineEntry {
    let date: Date
    let tasks: [String]
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> TaskEntry {
        TaskEntry(date: Date(), tasks: ["Przygotować prezentację", "Zadzwonić do klienta"])
    }

    func getSnapshot(in context: Context, completion: @escaping (TaskEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TaskEntry>) -> Void) {
        let token = UserDefaults(suiteName: appGroup)?.string(forKey: "supabase_access_token") ?? ""

        guard !token.isEmpty,
              let url = URL(string: "\(supabaseURL)/rest/v1/tasks?status=eq.in_progress&select=title&order=created_at.desc&limit=5")
        else {
            let entry = TaskEntry(date: Date(), tasks: [])
            completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(600))))
            return
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")

        URLSession.shared.dataTask(with: request) { data, _, _ in
            var taskTitles: [String] = []
            if let data, let json = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
                taskTitles = json.compactMap { $0["title"] as? String }
            }
            let entry = TaskEntry(date: Date(), tasks: taskTitles)
            let next = Date().addingTimeInterval(600) // refresh every 10 min
            completion(Timeline(entries: [entry], policy: .after(next)))
        }.resume()
    }
}

struct TasksWidgetEntryView: View {
    var entry: TaskEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("W trakcie")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.bottom, 2)

            if entry.tasks.isEmpty {
                Text("Brak zadań w trakcie")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            } else {
                let limit = family == .systemSmall ? 3 : 5
                ForEach(entry.tasks.prefix(limit), id: \.self) { task in
                    HStack(spacing: 4) {
                        Circle()
                            .fill(Color.orange)
                            .frame(width: 6, height: 6)
                        Text(task)
                            .font(.footnote)
                            .lineLimit(1)
                    }
                }
            }
            Spacer()
        }
        .padding()
    }
}

@main
struct TasksWidget: Widget {
    let kind: String = "TasksWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TasksWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("tasks")
        .description("Zadania w trakcie")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
