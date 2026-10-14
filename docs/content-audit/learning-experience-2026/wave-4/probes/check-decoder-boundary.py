"""Observe UTF-8 UNDERFLOW input ownership; this is a limited audit probe."""

from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

SOURCE = r'''
import java.nio.*;
import java.nio.charset.*;
class DecoderBoundary {
    public static void main(String[] args) {
        byte[] bytes = "한".getBytes(StandardCharsets.UTF_8);
        CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder();
        ByteBuffer input = ByteBuffer.allocate(8);
        CharBuffer output = CharBuffer.allocate(8);
        input.put(bytes, 0, 2).flip();
        CoderResult first = decoder.decode(input, output, false);
        System.out.println("first=" + first + ";position=" + input.position()
                + ";remaining=" + input.remaining());
        // The caller retains the unconsumed bytes, rather than discarding input.
        input.compact();
        input.put(bytes[2]).flip();
        CoderResult second = decoder.decode(input, output, true);
        decoder.flush(output);
        output.flip();
        System.out.println("preserved=" + second + ";codePoint=" + (int) output.charAt(0));
        CharsetDecoder other = StandardCharsets.UTF_8.newDecoder();
        other.decode(ByteBuffer.wrap(bytes, 0, 2), CharBuffer.allocate(8), false);
        System.out.println("tailOnly=" + other.decode(ByteBuffer.wrap(bytes, 2, 1),
                CharBuffer.allocate(8), true));
    }
}
'''

with TemporaryDirectory(prefix="csforge-decoder-audit-") as directory:
    path = Path(directory) / "DecoderBoundary.java"
    path.write_text(SOURCE, encoding="utf-8")
    print(subprocess.run(["javac", "-version"], capture_output=True,
                         text=True, check=True).stdout.strip())
    subprocess.run(["javac", "-encoding", "UTF-8", str(path)], check=True)
    result = subprocess.run(["java", "-Dfile.encoding=UTF-8", "-cp", directory,
                             "DecoderBoundary"], capture_output=True,
                            encoding="utf-8", check=True)
    print(result.stdout, end="")
    assert "first=UNDERFLOW;position=0;remaining=2" in result.stdout
    assert "preserved=UNDERFLOW;codePoint=54620" in result.stdout
    assert "tailOnly=MALFORMED[1]" in result.stdout
