/** 객체 초기화와 생성자 참고 자료의 쟁점만 독립적으로 재현한다. */
class ObjectModelProbe {
    static class Parent {
        Parent() { show(); }
        void show() { }
    }

    static class Ordinary extends Parent {
        String name = "kim";
        @Override void show() { System.out.println("ordinary=" + name); }
    }

    static class Early extends Parent {
        String name;
        Early() {
            name = "ready";
            super();
        }
        @Override void show() { System.out.println("early=" + name); }
    }

    static class Student {
        private int score;
        Student(String name, int age) { }
    }

    public static void main(String[] args) {
        System.out.println("runtime=" + Runtime.version());
        Ordinary ordinary = new Ordinary();
        ordinary.show();
        new Early();
        System.out.println("omittedIntScore=" + new Student("kim", 20).score);
    }
}
