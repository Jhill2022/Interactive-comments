import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import Minus from "./public/images/icon-minus.svg";
import Plus from "./public/images/icon-plus.svg";
import Reply from "./public/images/icon-reply.svg";
import Delete from "./public/images/icon-delete.svg";
import Edit from "./public/images/icon-edit.svg";
import data from "./data.json";

const CommentApp = () => {
  const [comments, setComments] = useState(data.comments);
  const customUser = data.currentUser;

  const editComment = (id, updatedContent) => {
    const updateReplies = (comments) =>
      comments.map((comment) => {
        if (comment.id === id) {
          // Update the comment content if the ID matches
          return { ...comment, content: updatedContent };
        } else if (comment.replies && comment.replies.length > 0) {
          // Recursively update nested replies
          return { ...comment, replies: updateReplies(comment.replies) };
        }
        return comment;
      });
  
    setComments((prev) => updateReplies(prev));
  };

  // Function to add a new comment
  const addComment = (newContent) => {
    const newComment = {
      id: uuid(),
      content: newContent,
      createdAt: "Just Now",
      score: 0,
      user: customUser,
      replies: [], // Always initialize replies as an empty array
    };
    setComments((prev) => [...prev, newComment]);
  };

  // Function to add a reply to a specific comment
  const addReply = (parentId, newReply) => {
    setComments((prev) => {
      const updateReplies = (comments) =>
        comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateReplies(comment.replies) };
          }
          return comment;
        });

      return updateReplies(prev);
    });
  };

  return (
    <div className="mt-16 w-[730px]">
      <CommentList
        comments={comments}
        onReply={addReply}
        currentUser={customUser}
        onEdit={editComment}
      />
      <UserCommentBox currentUser={customUser} addComment={addComment} />
    </div>
  );
};

const UserCommentBox = ({ currentUser, addComment }) => {
  const [userComment, setUserComment] = useState("");

  const handleAddComment = () => {
    if (userComment.trim()) {
      addComment(userComment);
      setUserComment(""); // Clear input after adding comment
    }
  };

  return (
    <div className="bg-white p-5 rounded-md shadow-md">
      <div className="flex justify-between gap-3">
        <img
          src={currentUser.image.png}
          alt=""
          className="w-10 h-10 rounded-full"
        />
        <textarea
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          className="resize-none border rounded w-full pt-2 pl-3 pb-11 text-sm"
          placeholder="Add a comment..."
        ></textarea>
        <div>
          <button
            onClick={handleAddComment}
            className="bg-[#5357B6] text-white px-7 py-2 rounded-md"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentList = ({ comments, onReply, currentUser, onEdit }) => (
  <ul className="relative">
    {comments.map((comment) => (
      <Comment
        key={comment.id}
        comment={comment}
        onReply={onReply}
        currentUser={currentUser}
        onEdit={onEdit}
      />
    ))}
  </ul>
);

const Comment = ({ comment, onReply, currentUser, onEdit }) => {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(comment.content);

  const handleReply = () => {
    if (replyText.trim()) {
      const newReply = {
        id: uuid(),
        content: `@${comment.user.username} ${replyText}`,
        createdAt: "Just Now",
        score: 0,
        user: currentUser,
        replies: [],
      };
      onReply(comment.id, newReply);
      setReplyText("");
      setShowReplyBox(false);
    }
  };

  const handleEdit = () => {
    onEdit(comment.id, newContent);
    setIsEditing(false);
  };

  return (
    <>
      <li className="list-none flex flex-col mb-3 bg-[#fff] p-6 gap-6 rounded-lg">
        <div className="flex gap-3">
          <div className="flex flex-col bg-[#F5F6FA] gap-3 items-center justify-center px-3 rounded-md h-24">
            <button>
              <img src={Plus} alt="Increase score" />
            </button>
            <span>{comment.score}</span>
            <button>
              <img src={Minus} alt="Decrease score" />
            </button>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between">
              <div className="flex gap-2 items-center">
                <img
                  className="w-7"
                  src={comment.user.image.png}
                  alt={comment.user.username}
                />
                <p className="text-[#334253] text-sm font-medium">
                  {comment.user.username}
                </p>
                {comment.user.username === currentUser.username && (
                  <span className="px-1 rounded-sm text-sm text-white bg-[#5357B6]">
                    you
                  </span>
                )}
                <p className="text-[#67727E] text-sm">{comment.createdAt}</p>
              </div>
              {comment.user.username === currentUser.username ? (
                <div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="flex items-center gap-1 text-[#ED6368] font-medium ml-2"
                    >
                      <img src={Delete} alt="" />
                      Delete
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-[#5357B6] font-medium ml-2"
                    >
                      <img src={Edit} alt="" />
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowReplyBox((prev) => !prev)}
                  className="flex items-center gap-2 text-[#5357B6] font-medium"
                >
                  <img src={Reply} alt="Reply icon" /> Reply
                </button>
              )}
            </div>
            {isEditing ? (
            <div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="resize-none border rounded w-full pt-2 pl-3 pb-2 text-sm"
              />
              <button onClick={handleEdit} className="bg-[#5357B6] text-white px-7 py-2 rounded-md mt-2">
                Save
              </button>
            </div>
          ) : (
            <p>
              {comment.replyingTo && <span className="text-[#5357B6] font-bold">@{comment.replyingTo} </span>}
              {comment.content}
            </p>
          )}
          </div>
        </div>
      </li>
      {showReplyBox && (
        <div className="bg-white p-5 rounded-md shadow-md mb-3">
          <div className="flex justify-between gap-3">
            <img
              src={currentUser.image.png}
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="resize-none border rounded w-full pt-2 pl-3 pb-11 text-sm"
              placeholder="Add a comment..."
            ></textarea>
            <div>
              <button
                onClick={handleReply}
                className="bg-[#5357B6] text-white px-7 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <ul className="pl-10 relative before:content-[''] before:absolute before:top-0 before:left-[10px] before:w-[2px] before:h-full before:bg-[#E9EBF0]">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              currentUser={currentUser}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
    </>
  );
};

export default CommentApp;