const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TaskItemSchema = new mongoose.Schema({
  id:        { type: String },
  name:      { type: String },
  text:      { type: String },
  completed: { type: Boolean, default: false },
  date:      { type: Date, default: Date.now }
}, { _id: false });

const CustomModuleSchema = new mongoose.Schema({
  id:          { type: String, required: true },
  title:       { type: String, required: true },
  category:    { type: String, default: 'General' },
  description: { type: String, default: '' },
  accentColor: { type: String, default: '#124F34' },
  tasks:       { type: [TaskItemSchema], default: [] }
}, { _id: false });

const ShopRewardSchema = new mongoose.Schema({
  id:       { type: mongoose.Schema.Types.Mixed },
  title:    { type: String, required: true },
  cost:     { type: Number, default: 50 },
  category: { type: String, default: 'Leisure' },
  icon:     { type: String, default: 'Sparkles' }
}, { _id: false });

const RedemptionEntrySchema = new mongoose.Schema({
  id:         { type: mongoose.Schema.Types.Mixed },
  title:      { type: String },
  cost:       { type: Number },
  category:   { type: String },
  redeemedAt: { type: String }
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    avatar: { type: String, default: '🧠' },
    level:  { type: Number, default: 1, min: 1 },
    xp:     { type: Number, default: 0, min: 0 },
    coins:  { type: Number, default: 0, min: 0 },
    streak: { type: Number, default: 0, min: 0 },
    lastActiveDate:     { type: Date, default: null },
    lastQualifyingDate: { type: String, default: null },

    // User settings
    settings: {
      isDark:       { type: Boolean, default: false },
      theme:        { type: String, default: 'light' },
      isMuted:      { type: Boolean, default: false },
      soundEnabled: { type: Boolean, default: true }
    },

    // Custom modules / workspace
    customModules: { type: [CustomModuleSchema], default: [] },

    // Rewards shop
    shopRewards: { type: [ShopRewardSchema], default: [] },
    redeemedHistory: { type: [RedemptionEntrySchema], default: [] },

    // Badges
    unlockedBadges: [
      {
        id:          { type: String, required: true },
        name:        { type: String, required: true },
        icon:        { type: String, default: '🏆' },
        description: { type: String },
        unlockedAt:  { type: Date, default: Date.now }
      }
    ],

    // Legacy custom sections (kept for backwards compatibility)
    customSections: [
      {
        title: { type: String, required: true },
        type:  { type: String, default: 'checklist' },
        color: { type: String, default: '#6366f1' },
        items: [
          {
            text:      { type: String },
            completed: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
