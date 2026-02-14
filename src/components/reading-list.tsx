import type { GeneratedTheme } from "@/lib/theme-schema"
import type { HardcoverBook } from "@/lib/hardcover"

interface ReadingListProps {
  theme: GeneratedTheme
  variant: GeneratedTheme["style"]["layoutVariant"]
  books: HardcoverBook[]
}

const STATUS_LABELS: Record<HardcoverBook["status"], string> = {
  "currently-reading": "Reading Now",
  read: "Finished",
  "want-to-read": "Up Next",
}

function BookCover({ book }: { book: HardcoverBook }) {
  if (book.coverUrl) {
    return (
      <img
        src={book.coverUrl}
        alt={`Cover of ${book.title}`}
        className="h-full w-full object-cover"
        crossOrigin="anonymous"
      />
    )
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center p-2 text-center text-xs font-medium"
      style={{
        backgroundColor: "var(--theme-accent)",
        color: "var(--theme-bg)",
      }}
    >
      {book.title}
    </div>
  )
}

export function ReadingList({ theme, variant, books }: ReadingListProps) {
  const currentlyReading = books.filter((b) => b.status === "currently-reading")
  const read = books.filter((b) => b.status === "read")
  const wantToRead = books.filter((b) => b.status === "want-to-read")

  const groupedBooks = [
    { label: "Reading Now", books: currentlyReading },
    { label: "Finished", books: read },
    { label: "Up Next", books: wantToRead },
  ].filter((g) => g.books.length > 0)

  if (variant === "terminal") {
    return (
      <section
        className="flex flex-col gap-4 py-8"
        style={{
          fontFamily: "var(--theme-mono-font)",
          borderBottom: `1px solid var(--theme-border)`,
        }}
      >
        <div className="text-sm" style={{ color: "var(--theme-fg-muted)" }}>
          {'> cat reading-list.json | jq'}
        </div>
        {groupedBooks.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <div className="text-xs uppercase" style={{ color: "var(--theme-accent)" }}>
              {'// '}{group.label}
            </div>
            {group.books.map((book, i) => (
              <div key={i} className="flex items-center gap-3 pl-2 text-sm">
                <span style={{ color: "var(--theme-accent-secondary)" }}>-</span>
                <span style={{ color: "var(--theme-fg)" }}>
                  {'"'}{book.title}{'"'}
                </span>
                <span style={{ color: "var(--theme-fg-muted)" }}>
                  {'// '}{book.author}
                </span>
                {book.rating && (
                  <span style={{ color: "var(--theme-accent)" }}>
                    [{'\u2605'.repeat(book.rating)}]
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
    )
  }

  if (variant === "brutalist") {
    return (
      <section className="py-10" style={{ borderBottom: `4px solid var(--theme-fg)` }}>
        <h2
          className="mb-8 text-2xl font-black uppercase"
          style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
        >
          {theme.copy.readingSectionTitle}
        </h2>
        {groupedBooks.map((group) => (
          <div key={group.label} className="mb-6">
            <div
              className="mb-3 text-sm font-bold uppercase"
              style={{ color: "var(--theme-accent)" }}
            >
              {group.label}
            </div>
            <div className="flex flex-col gap-0">
              {group.books.map((book, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2"
                  style={{ borderTop: `1px solid var(--theme-border)` }}
                >
                  <div>
                    <span className="font-bold" style={{ color: "var(--theme-fg)" }}>
                      {book.title}
                    </span>
                    <span className="ml-2 text-sm" style={{ color: "var(--theme-fg-muted)" }}>
                      {book.author}
                    </span>
                  </div>
                  {book.rating && (
                    <span style={{ color: "var(--theme-accent)" }}>
                      {'\u2605'.repeat(book.rating)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  if (variant === "magazine") {
    return (
      <section className="py-16">
        <div
          className="mb-2 text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--theme-accent)" }}
        >
          {theme.copy.readingSectionTitle}
        </div>
        <div className="mb-8 h-px" style={{ backgroundColor: "var(--theme-border)" }} />
        {groupedBooks.map((group) => (
          <div key={group.label} className="mb-10">
            <div
              className="mb-4 text-xs font-medium uppercase tracking-widest"
              style={{ color: "var(--theme-fg-muted)" }}
            >
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {group.books.map((book, i) => (
                <div key={i} className="theme-animate flex flex-col gap-2" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div
                    className="aspect-[2/3] overflow-hidden"
                    style={{ borderRadius: "var(--theme-radius)" }}
                  >
                    <BookCover book={book} />
                  </div>
                  <h4
                    className="text-sm font-medium leading-tight"
                    style={{ color: "var(--theme-fg)" }}
                  >
                    {book.title}
                  </h4>
                  <p className="text-xs" style={{ color: "var(--theme-fg-muted)" }}>
                    {book.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  if (variant === "cards") {
    return (
      <section className="py-12">
        <h2
          className="mb-8 text-2xl font-bold"
          style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
        >
          {theme.copy.readingSectionTitle}
        </h2>
        {groupedBooks.map((group) => (
          <div key={group.label} className="mb-8">
            <div
              className="mb-4 text-sm font-medium"
              style={{ color: "var(--theme-accent)" }}
            >
              {group.label}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.books.map((book, i) => (
                <div
                  key={i}
                  className="theme-animate flex items-center gap-4 p-4"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    backgroundColor: "var(--theme-bg-secondary)",
                    borderRadius: "var(--theme-radius)",
                    border: `1px solid var(--theme-border)`,
                  }}
                >
                  <div
                    className="h-16 w-11 shrink-0 overflow-hidden"
                    style={{ borderRadius: `calc(var(--theme-radius) / 2)` }}
                  >
                    <BookCover book={book} />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <h4
                      className="truncate text-sm font-medium"
                      style={{ color: "var(--theme-fg)" }}
                    >
                      {book.title}
                    </h4>
                    <p className="truncate text-xs" style={{ color: "var(--theme-fg-muted)" }}>
                      {book.author}
                    </p>
                    <span className="mt-1 text-xs" style={{ color: "var(--theme-accent-secondary)" }}>
                      {STATUS_LABELS[book.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  // Classic
  return (
    <section className="py-12">
      <h2
        className="mb-8 text-2xl font-bold"
        style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
      >
        {theme.copy.readingSectionTitle}
      </h2>
      {groupedBooks.map((group) => (
        <div key={group.label} className="mb-8">
          <div
            className="mb-4 text-sm font-medium uppercase tracking-wider"
            style={{ color: "var(--theme-accent)" }}
          >
            {group.label}
          </div>
          <div className="flex flex-col gap-3">
            {group.books.map((book, i) => (
              <div
                key={i}
                className="theme-animate flex items-center gap-4"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className="h-14 w-10 shrink-0 overflow-hidden"
                  style={{ borderRadius: `calc(var(--theme-radius) / 2)` }}
                >
                  <BookCover book={book} />
                </div>
                <div>
                  <h4 className="text-sm font-medium" style={{ color: "var(--theme-fg)" }}>
                    {book.title}
                  </h4>
                  <p className="text-xs" style={{ color: "var(--theme-fg-muted)" }}>
                    {book.author}
                  </p>
                </div>
                {book.rating && (
                  <span className="ml-auto text-xs" style={{ color: "var(--theme-accent)" }}>
                    {'\u2605'.repeat(book.rating)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
