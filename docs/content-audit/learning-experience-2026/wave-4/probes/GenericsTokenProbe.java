import java.lang.reflect.Array;
import java.util.List;
class GenericsTokenProbe {
    static <T> T[] newArray(Class<T> type, int length) {
        @SuppressWarnings("unchecked")
        T[] result = (T[]) Array.newInstance(type, length);
        return result;
    }
    public static void main(String[] args) {
        System.out.println("runtime=" + Runtime.version());
        System.out.println("referenceToken=" + newArray(String.class, 1).getClass().getTypeName());
        Class<Integer> token = int.class;
        System.out.println("primitiveArray=" + Array.newInstance(token, 1).getClass().getTypeName());
        try {
            Integer[] values = newArray(token, 1);
            throw new AssertionError("Expected cast failure");
        } catch (ClassCastException expected) {
            System.out.println("genericPrimitiveToken=ClassCastException");
        }
    }
}
