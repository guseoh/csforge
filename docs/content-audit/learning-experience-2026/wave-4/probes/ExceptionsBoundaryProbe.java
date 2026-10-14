import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
class ExceptionsBoundaryProbe {
    static class Item { int value = 1; }
    static void validateAndModify(List<Item> updated) {
        updated.getFirst().value = 2;
        throw new IllegalStateException("later validation failed");
    }
    public static void main(String[] args) {
        System.out.println("runtime=" + Runtime.version());
        List<Item> items = new ArrayList<>(List.of(new Item()));
        try {
            List<Item> updated = new ArrayList<>(items);
            validateAndModify(updated);
            items = List.copyOf(updated);
        } catch (IllegalStateException expected) {
            System.out.println("sharedItemAfterFailure=" + items.getFirst().value);
        }
        var map = new HashMap<String, String>();
        map.put("present", null);
        System.out.println("get=" + map.get("present") + ";containsKey=" + map.containsKey("present"));
    }
}
