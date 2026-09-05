import { describe, expect, it } from 'vitest';
import { readRecommendationStream, type GuideProgress } from './recommend';

describe('guide response reader', () => {
  it('@claim:guide-stream exposes a complete matching result before a chunked response finishes', async () => {
    const encoder = new TextEncoder();
    let sendRemainder = (): void => undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"picks":[{"slug":"first-tool","why":"It handles the first job."}'));
        sendRemainder = () => {
          controller.enqueue(encoder.encode(',{"slug":"second-tool","why":"It handles the second job."}],"note":"Two matches."}'));
          controller.close();
        };
      },
    });
    const progress: GuideProgress[] = [];
    const resultPromise = readRecommendationStream(new Response(body), (update) => progress.push(update));
    await Promise.resolve();

    expect(progress.at(-1)?.picks.map(({ slug }) => slug)).toEqual(['first-tool']);
    sendRemainder();
    const result = await resultPromise;

    expect(result.picks.map(({ slug }) => slug)).toEqual(['first-tool', 'second-tool']);
    expect(progress.at(-1)?.picks.map(({ slug }) => slug)).toEqual(['first-tool', 'second-tool']);
    expect(progress.at(-1)!.bytesReceived).toBeGreaterThan(progress[0].bytesReceived);
  });
});
