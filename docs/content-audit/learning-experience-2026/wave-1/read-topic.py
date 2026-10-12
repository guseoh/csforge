"""Print complete canonical articles and questions for a manual Topic review; no verdicts."""

import argparse
import json
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[4]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("area")
    parser.add_argument("topic")
    args = parser.parse_args()
    curriculum = yaml.safe_load((ROOT / "content/curriculum" / (args.area + ".yaml")).read_text(encoding="utf-8"))
    catalog = json.loads((ROOT / "content" / args.area / "topics.json").read_text(encoding="utf-8"))
    topic = next(t for t in catalog if t["slug"] == args.topic)
    planned = next(t for t in curriculum["topics"] if t["key"] == topic["contentKey"])
    print(json.dumps({"topic": topic, "curriculum": planned}, ensure_ascii=False, indent=2))
    folder = ROOT / "content" / args.area / args.topic
    for path in sorted(folder.glob("*.md")):
        print("\nSOURCE " + path.relative_to(ROOT).as_posix())
        print(path.read_text(encoding="utf-8"))
    for question in json.loads((folder / "questions.json").read_text(encoding="utf-8")):
        print("\nQUESTION " + question["contentKey"] + " " + question["questionType"] + " " + question["difficulty"])
        print("LINKS " + ", ".join(question["conceptKeys"]))
        print("PROMPT\n" + question["promptMarkdown"])
        for choice in question.get("choices", []):
            print("CHOICE " + choice["key"] + ": " + choice["content"])
            print("RATIONALE " + choice.get("rationaleMarkdown", ""))
        if "correctChoiceKey" in question:
            print("CORRECT " + question["correctChoiceKey"])
        if "acceptedAnswers" in question:
            print("ACCEPTED " + json.dumps(question["acceptedAnswers"], ensure_ascii=False))
        if "modelAnswer" in question:
            print("MODEL " + question["modelAnswer"])
        print("EXPLANATION " + question.get("explanationMarkdown", ""))


if __name__ == "__main__":
    main()
