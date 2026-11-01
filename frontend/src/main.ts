import { HlmNativeSelect } from "@spartan-ng/helm/native-select";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmCard } from "@spartan-ng/helm/card";
import {
  Component,
  signal,
  computed,
  inject,
  provideZonelessChangeDetection,
} from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
} from "@angular/common/http";
import { firstValueFrom } from "rxjs";
interface Entity {
  id: string;
  createdAt: string;
}
class Api {
  private http = inject(HttpClient);
  async get<T>(path: string): Promise<T> {
    return (await firstValueFrom(this.http.get<{ data: T }>("/api/" + path)))
      .data;
  }
  async send<T>(method: string, path: string, body: unknown = {}): Promise<T> {
    return (
      await firstValueFrom(
        this.http.request<{ data: T }>(method, "/api/" + path, { body }),
      )
    ).data;
  }
}
interface Board extends Entity {
  name: string;
  description: string;
}
interface Stage extends Entity {
  boardId: string;
  name: string;
  position: number;
}
interface Card extends Entity {
  stageId: string;
  title: string;
  description: string;
  assignee: string;
  label: string;
  priority: string;
  dueDate: string | null;
}
interface BoardDetail {
  board: Board;
  stages: { stage: Stage; cards: Card[] }[];
}
@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButton,
    HlmInput,
    HlmCard,
    HlmNativeSelect,
  ],
  templateUrl: "./app.html",
  host: { "(document:keydown.escape)": "close()" },
})
class AppComponent {
  error = signal("");
  notice = signal("");
  busy = signal(false);
  panel = signal("");
  query = signal("");
  api = new Api();
  async run(fn: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    this.notice.set("");
    try {
      await fn();
    } catch (e) {
      this.error.set(
        e instanceof HttpErrorResponse
          ? e.error?.error ||
              "Sunucuya ulaşılamadı. API bağlantısını kontrol edin."
          : e instanceof Error
            ? e.message
            : "İşlem tamamlanamadı.",
      );
    } finally {
      this.busy.set(false);
    }
  }
  close() {
    this.panel.set("");
  }
  money(c: number) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(c / 100);
  }
  date(d: string) {
    return new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  time(d: string) {
    return new Date(d).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  boards = signal<Board[]>([]);
  detail = signal<BoardDetail | null>(null);
  filter = signal("");
  editing: Card | null = null;
  dragged = "";
  boardName = "";
  boardDescription = "";
  stageName = "";
  card = {
    stageId: "",
    title: "",
    description: "",
    assignee: "",
    label: "Genel",
    priority: "NORMAL",
    dueDate: "",
  };
  all = computed(() => this.detail()?.stages.flatMap((x) => x.cards) || []);
  done = computed(() => this.detail()?.stages.at(-1)?.cards.length || 0);
  constructor() {
    void this.run(async () => {
      this.boards.set(await this.api.get<Board[]>("boards"));
      if (this.boards()[0]) await this.load(this.boards()[0].id);
    });
  }
  async load(id: string) {
    this.detail.set(await this.api.get<BoardDetail>("boards/" + id));
  }
  select(id: string) {
    void this.run(() => this.load(id));
  }
  visible(cards: Card[]) {
    return cards.filter(
      (c) =>
        (c.title + " " + c.assignee + " " + c.label)
          .toLocaleLowerCase("tr")
          .includes(this.query().toLocaleLowerCase("tr")) &&
        (!this.filter() || c.priority === this.filter()),
    );
  }
  newCard(id = "") {
    this.editing = null;
    this.card = {
      stageId: id || this.detail()?.stages[0]?.stage.id || "",
      title: "",
      description: "",
      assignee: "",
      label: "Genel",
      priority: "NORMAL",
      dueDate: "",
    };
    this.panel.set("card");
  }
  edit(c: Card) {
    this.editing = c;
    this.card = {
      stageId: c.stageId,
      title: c.title,
      description: c.description,
      assignee: c.assignee,
      label: c.label,
      priority: c.priority,
      dueDate: c.dueDate || "",
    };
    this.panel.set("card");
  }
  saveBoard() {
    void this.run(async () => {
      const b = await this.api.send<Board>("POST", "boards", {
        name: this.boardName,
        description: this.boardDescription,
      });
      this.boards.set(await this.api.get<Board[]>("boards"));
      await this.load(b.id);
      this.close();
      this.boardName = "";
      this.boardDescription = "";
    });
  }
  saveStage() {
    void this.run(async () => {
      const id = this.detail()!.board.id;
      await this.api.send("POST", "boards/" + id + "/stages", {
        name: this.stageName,
      });
      await this.load(id);
      this.stageName = "";
    });
  }
  saveCard() {
    void this.run(async () => {
      const data = { ...this.card, dueDate: this.card.dueDate || null };
      if (this.editing) {
        await this.api.send("PUT", "cards/" + this.editing.id, data);
        if (this.editing.stageId !== this.card.stageId)
          await this.api.send("PATCH", "cards/" + this.editing.id + "/move", {
            stageId: this.card.stageId,
          });
      } else await this.api.send("POST", "cards", data);
      await this.load(this.detail()!.board.id);
      this.close();
    });
  }
  remove() {
    if (!this.editing || !confirm("Bu kart silinsin mi?")) return;
    void this.run(async () => {
      await this.api.send("DELETE", "cards/" + this.editing!.id);
      await this.load(this.detail()!.board.id);
      this.close();
    });
  }
  drop(event: DragEvent, id: string) {
    event.preventDefault();
    if (this.dragged)
      void this.run(async () => {
        await this.api.send("PATCH", "cards/" + this.dragged + "/move", {
          stageId: id,
        });
        await this.load(this.detail()!.board.id);
        this.dragged = "";
      });
  }
}
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideZonelessChangeDetection()],
}).catch(console.error);
