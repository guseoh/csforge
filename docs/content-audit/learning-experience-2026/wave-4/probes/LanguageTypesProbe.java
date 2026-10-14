import java.util.Arrays;
import java.util.Locale;

/** 언어 타입 감사에서 발견한 전제와 반례를 독립적으로 재현한다. */
class LanguageTypesProbe {
    public static void main(String[] args) {
        System.out.println("runtime=" + Runtime.version());
        byte literal = 42;
        final byte a = 1;
        final byte b = 2;
        byte constantSum = a + b;
        System.out.println("implicitNarrowing=" + literal + ":" + constantSum);

        String total = "";
        for (Integer n : Arrays.asList((Integer) null)) {
            total += n;
        }
        System.out.println("stringTotalWithNull=" + total);
        try {
            int numericTotal = 0;
            for (Integer n : Arrays.asList((Integer) null)) {
                numericTotal += n;
            }
        } catch (NullPointerException expected) {
            System.out.println("intTotalWithNull=NullPointerException");
        }

        Locale prior = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag("tr-TR"));
            System.out.println("kimUpperDefaultCodePoints=" + Arrays.toString("kim".toUpperCase().codePoints().toArray()));
            System.out.println("kimUpperRoot=" + "kim".toUpperCase(Locale.ROOT));
        } finally {
            Locale.setDefault(prior);
        }

        String part = "ja";
        String runtimeConcat = part + "va";
        final String constantPart = "ja";
        String constantConcat = constantPart + "va";
        System.out.println("concatIdentity=" + (runtimeConcat == "java") + ":" + (constantConcat == "java"));
    }
}
