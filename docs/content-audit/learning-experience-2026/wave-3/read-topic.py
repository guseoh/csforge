"""Print bounded, complete Concept bodies and linked Question fields; no verdicts."""

import argparse
import json
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[4]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("area")
    parser.add_argument("topic")
    parser.add_argument("--start", type=int, default=0, help="Zero-based Concept index in display order")
    parser.add_argument("--count", type=int, default=4)
    args = parser.parse_args()
    if args.start < 0 or args.count < 1:
        parser.error("start must be nonnegative and count positive")
    curriculum = yaml.safe_load((ROOT / "content/curriculum" / f"{args.area}.yaml").read_text(encoding="utf-8"))
    catalog = json.loads((ROOT / "content" / args.area / "topics.json").read_text(encoding="utf-8"))
    topic = next(t for t in catalog if t["slug"] == args.topic)
    planned = next(t for t in curriculum["topics"] if t["key"] == topic["contentKey"])
    folder = ROOT / "content" / args.area / args.topic
    articles = []
    for path in folder.glob("*.md"):
        text = path.read_text(encoding="utf-8")
        meta = yaml.safe_load(text.split("---", 2)[1])
        articles.append((meta["displayOrder"], meta["contentKey"], path, text))
    selected = sorted(articles)[args.start:args.start + args.count]
    if not selected:
        parser.error("selection contains no Concepts")
    keys = {a[1] for a in selected}
    planned = {**planned, "concepts": [c for c in planned["concepts"] if c["key"] in keys]}
    questions = json.loads((folder / "questions.json").read_text(encoding="utf-8"))
    selected_questions = [q for q in questions if keys.intersection(q["conceptKeys"])]
    print(json.dumps({"topic": topic, "curriculum": planned, "topicConceptCount": len(articles),
                      "topicQuestionCount": len(questions), "selectionKeys": sorted(keys),
                      "selectionQuestionKeys": [q["contentKey"] for q in selected_questions]}, ensure_ascii=False, indent=2))
    for _, _, path, text in selected:
        print("\nSOURCE " + path.relative_to(ROOT).as_posix())
        print(text)
    for question in selected_questions:
        print("\nQUESTION " + question["contentKey"])
        # Print every actual field, including future fields; preserve Markdown newlines.
        for name, value in question.items():
            print(name.upper())
            if isinstance(value, str):
                print(value)
            else:
                print(json.dumps(value, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
