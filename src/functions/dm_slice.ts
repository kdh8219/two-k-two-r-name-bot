export function dm_slice(raw: string): string[] {
  function slasher(txt: string): { front: string; end: string } {
    let front = txt.slice(0, 2000);
    let end = txt.slice(2000);
    if (end) {
      const IndexOfLastBlock = front.lastIndexOf("\n\n");
      end = "ㅤ" /* 공백문자 */ + front.slice(IndexOfLastBlock + 1) + end;
      front = front.slice(0, IndexOfLastBlock);
    }
    return { front, end };
  }

  const output: string[] = [];

  let slashed = slasher(raw);
  while (true) {
    output.push(slashed.front);
    if (slashed.end) {
      slashed = slasher(slashed.end);
    } else {
      return output;
    }
  }
}
