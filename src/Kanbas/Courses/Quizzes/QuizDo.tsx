
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { GoPencil } from "react-icons/go";
import * as coursesClient from "../client"; // 模拟的客户端接口，用于加载 Quiz 数据
import { setQuestions } from "./Questions/reducer";


export default function QuizDo() {
    const { cid, quizId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { quizzes } = useSelector((state: any) => state.quizzesReducer);
    const { questions } = useSelector((state: any) => state.questionsReducer);
    const filteredQuestion = questions .filter((question: any) => question.quizId === quizId)

    const quiz = quizzes?.find((q: any) => q._id === quizId);
    const [answers, setAnswers] = useState<any>({});
    const [score, setScore] = useState<number | null>(null);
    const [lastAttempt, setLastAttempt] = useState<any>(null);


    const fetchQuestions = async () => {
        const questions = await coursesClient.findQuestionsForQuiz(cid, quizId);
        dispatch(setQuestions(questions));
    };


    useEffect(() => {

        fetchQuestions();
    }, []);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers({
            ...answers,
            [questionId]: value,
        });
    };


    if (!quiz) {
        return <p>Loading quiz...</p>;
    }

    console.log("this is quizId", quizId)

    return (
        <div id="quiz-preview" className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-center">Quiz Preview: {quiz.title || "Quiz"}</h1>
\
            </div>


            {/* 显示开始时间 */}
            <div className="mb-4">
                <h2 className="text-muted">Started: {format(new Date(), "MMM d 'at' h:mm a")}</h2>
            </div>

            {score !== null && (
                <div className="alert alert-success">
                    <p>Your score: {score}</p>
                </div>
            )}

            {lastAttempt && (
                <div className="alert alert-info">
                    <p>Last Attempt:</p>
                    <ul>
                        {Object.keys(lastAttempt.answers).map((key) => (
                            <li key={key}>
                                Question {key}: {lastAttempt.answers[key]}
                            </li>
                        ))}
                    </ul>
                    <p>Date: {format(new Date(lastAttempt.date), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
            )}

            <form onSubmit={(e) => {
                e.preventDefault();
                // handleSubmit(); // 替换为你的提交逻辑
            }}>
                {questions ? (
                    questions.length > 0 ? (
                        questions
                            .filter((question: any) => question.quizId === quizId)
                            .map((question: any) => (
                                <div key={question._id} className="mb-4">
                                    <p>
                                        <strong>
                                            {question.title} {question.text} {question.type}
                                        </strong>
                                    </p>
                                    {question.type === "Fill in the Blank" && (
                                        <div className="form-group">
                                            <p className="question-description">{question.description}</p>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id={`${question._id}-${question.answers._id}`}
                                                name={question._id}
                                                placeholder="Type your answer here..."
                                                value={answers[question._id] || ""}
                                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                            />
                                        </div>
                                    )}



                                    {question.type === "True/False" &&
                                        question.answers.map((answer: any) => (
                                        <div>
                                            <label>
                                                <input
                                                    type="radio"
                                                    id={`${question._id}-${answer._id}`}
                                                    name={question._id}
                                                    value="True"
                                                    checked={answers[question._id] === "True"}
                                                    onChange={() => handleAnswerChange(question._id, answer.text)}
                                                />
                                                True
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    id={`${question._id}-${answer._id}`}
                                                    name={question._id}
                                                    value="False"
                                                    checked={answers[question._id] === "False"}
                                                    onChange={() => handleAnswerChange(question._id, answer.text)}
                                                />
                                                False
                                            </label>
                                        </div>
                                        ))}

                                    {question.type === "Multiple Choice" &&
                                        question.answers.map((answer: any) => (
                                            <div key={answer._id} className="form-check">
                                                <input
                                                    type="radio"
                                                    className="form-check-input"
                                                    id={`${question._id}-${answer._id}`}
                                                    name={question._id}
                                                    value={answer.text}
                                                    checked={answers[question._id] === answer.text}
                                                    onChange={() => handleAnswerChange(question._id, answer.text)}
                                                />
                                                <label htmlFor={`${question._id}-${answer._id}`} className="form-check-label">
                                                    {answer.text}
                                                </label>
                                            </div>
                                        ))}

                                </div>
                            ))
                    ) : (
                        <p>No questions available for this quiz.</p>
                    )
                ) : (
                    <p>Loading questions...</p>
                )}

                <button className="btn btn-success" type="submit">
                    Submit Quiz
                </button>
            </form>

        </div>
    );
}