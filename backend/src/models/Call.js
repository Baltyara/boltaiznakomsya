const db = require('../config/database');

class Call {
  static async create(callData) {
    const { userId1, userId2, duration, rating, feedback, action } = callData;
    
    const query = `
      INSERT INTO calls (user_id_1, user_id_2, duration, rating, feedback, action, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, user_id_1, user_id_2, duration, rating, feedback, action, created_at
    `;
    
    const values = [userId1, userId2, duration, rating, feedback, action];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating call: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT c.*, 
             u1.name as user1_name, u1.age as user1_age, u1.gender as user1_gender,
             u2.name as user2_name, u2.age as user2_age, u2.gender as user2_gender
      FROM calls c
      JOIN users u1 ON c.user_id_1 = u1.id
      JOIN users u2 ON c.user_id_2 = u2.id
      WHERE c.id = $1
    `;
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding call: ${error.message}`);
    }
  }

  static async getUserCalls(userId, limit = 20, offset = 0) {
    const query = `
      SELECT c.*, 
             u1.name as user1_name, u1.age as user1_age, u1.gender as user1_gender,
             u2.name as user2_name, u2.age as user2_age, u2.gender as user2_gender
      FROM calls c
      JOIN users u1 ON c.user_id_1 = u1.id
      JOIN users u2 ON c.user_id_2 = u2.id
      WHERE c.user_id_1 = $1 OR c.user_id_2 = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await db.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting user calls: ${error.message}`);
    }
  }

  static async updateRating(callId, rating, feedback) {
    const query = `
      UPDATE calls 
      SET rating = $1, feedback = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, rating, feedback
    `;
    
    try {
      const result = await db.query(query, [rating, feedback, callId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating call rating: ${error.message}`);
    }
  }

  static async getCallStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_calls,
        AVG(duration) as avg_duration,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN action = 'like' THEN 1 END) as total_likes,
        COUNT(CASE WHEN action = 'pass' THEN 1 END) as total_passes
      FROM calls 
      WHERE user_id_1 = $1 OR user_id_2 = $1
    `;
    
    try {
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting call stats: ${error.message}`);
    }
  }

  static async getRecentMatches(userId, limit = 5) {
    const query = `
      SELECT DISTINCT 
        CASE 
          WHEN c.user_id_1 = $1 THEN c.user_id_2
          ELSE c.user_id_1
        END as partner_id,
        u.name as partner_name,
        u.age as partner_age,
        u.gender as partner_gender,
        u.interests as partner_interests,
        MAX(c.created_at) as last_call
      FROM calls c
      JOIN users u ON (
        CASE 
          WHEN c.user_id_1 = $1 THEN c.user_id_2
          ELSE c.user_id_1
        END = u.id
      )
      WHERE c.user_id_1 = $1 OR c.user_id_2 = $1
      GROUP BY partner_id, u.name, u.age, u.gender, u.interests
      ORDER BY last_call DESC
      LIMIT $2
    `;
    
    try {
      const result = await db.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting recent matches: ${error.message}`);
    }
  }

  static async getLikedUsers(userId) {
    const query = `
      SELECT DISTINCT 
        CASE 
          WHEN c.user_id_1 = $1 THEN c.user_id_2
          ELSE c.user_id_1
        END as partner_id,
        u.name as partner_name,
        u.age as partner_age,
        u.gender as partner_gender,
        u.interests as partner_interests
      FROM calls c
      JOIN users u ON (
        CASE 
          WHEN c.user_id_1 = $1 THEN c.user_id_2
          ELSE c.user_id_1
        END = u.id
      )
      WHERE (c.user_id_1 = $1 OR c.user_id_2 = $1)
        AND c.action = 'like'
      ORDER BY c.created_at DESC
    `;
    
    try {
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting liked users: ${error.message}`);
    }
  }
}

module.exports = Call; 