"use client"; // Error components must be Client Components

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      {process.env.NODE_ENV == "development" && <pre>{error.message}</pre>}
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
