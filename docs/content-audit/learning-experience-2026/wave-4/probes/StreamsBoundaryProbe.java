import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
class StreamsBoundaryProbe {
    record Order(String userId, int time) {}
    public static void main(String[] args) {
        System.out.println("runtime=" + Runtime.version());
        Stream<Integer> s = Stream.of(1, 2).peek(System.out::print);
        System.out.print("|");
        s.forEach(x -> {});
        System.out.println();
        System.out.println("observedSequentialSubtraction=" + Stream.of(1, 2, 3).reduce(0, (a,b) -> a-b));
        System.out.println("isEmptyFilter=" + Stream.of(List.of(1), List.<Integer>of()).filter(List::isEmpty).toList());
        var byUser = Stream.of(new Order("u",20), new Order("u",10))
            .collect(Collectors.toMap(Order::userId, x -> x, (oldOrder,newOrder) -> newOrder));
        System.out.println("lastEncounteredTime=" + byUser.get("u").time());
    }
}
