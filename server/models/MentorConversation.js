const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  suggestions: [String]
});

const mentorConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    messages: [chatMessageSchema],
    contextSummary: {
      type: String,
      default: 'Ongoing student preparation coaching'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MentorConversation', mentorConversationSchema);
