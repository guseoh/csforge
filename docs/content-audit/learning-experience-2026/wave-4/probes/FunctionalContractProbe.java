import java.util.function.Consumer;
import java.util.function.Function;
class FunctionalContractProbe {
    static String trim(String value) { return value.trim(); }
    public static void main(String[] args) {
        System.out.println("runtime=" + Runtime.version());
        Function<String, String> f = String -> trim(String);
        System.out.println("uppercaseParameter=" + f.apply("  java  "));
        int[] calls = {0};
        Consumer<String> consume = value -> calls[0]++;
        consume.accept("input");
        System.out.println("consumerTakesInput=" + calls[0]);
    }
}
