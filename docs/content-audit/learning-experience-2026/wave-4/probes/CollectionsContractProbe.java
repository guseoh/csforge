import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** 컬렉션 감사의 null 입력과 조회 비변경 쟁점만 대조한다. */
class CollectionsContractProbe {
    public static void main(String[] args) {
        System.out.println("runtime=" + Runtime.version());
        List<String> source = new ArrayList<>(Arrays.asList("A", null));
        try {
            List.copyOf(source);
            throw new AssertionError("null should be rejected");
        } catch (NullPointerException expected) {
            System.out.println("copyOfNull=NullPointerException");
        }
        Map<String, Integer> map = new HashMap<>();
        map.put("kim", 1);
        System.out.println("get=" + map.get("kim") + ";mappingAfterGet=" + map.get("kim"));
        if (map.get("kim") != 1) throw new AssertionError("get changed mapping");
    }
}
