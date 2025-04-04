#!/bin/bash

# Script avançado para geração de dados de teste para o PayloadCMS
# Com múltiplos planos de dieta, dias com diferentes padrões de repetição
# e diversas refeições para testar o endpoint /history

# Define variables
API_URL="http://localhost:3000/api"
PAYLOAD_TOKEN=${1:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY29sbGVjdGlvbiI6InVzZXJzIiwiZW1haWwiOiJtQG0uY29tIiwiaWF0IjoxNzQzNTQ0NzI2LCJleHAiOjE3NDM1NTE5MjZ9.iO9HaE1iGLA9jxrFVFNHpjQLWudkVkBIve_uYeG2OSs"}
AUTH_HEADER="Cookie: payload-token=$PAYLOAD_TOKEN"
CONTENT_TYPE="Content-Type: application/json"

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "🔄 Creating $endpoint..."
    response=$(curl -s -X $method "$API_URL/$endpoint" -H "$AUTH_HEADER" -H "$CONTENT_TYPE" -d "$data")
    
    # Extract ID from response
    id=$(echo $response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ -z "$id" ]; then
        echo "❌ Failed to create $endpoint"
        echo $response
        return 1
    else
        echo "✅ Created $endpoint with ID: $id"
        return 0
    fi
}

format_date() {
    # Format date based on platform (macOS or Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        date -v "$1" +%Y-%m-%d
    else
        date -d "$1" +%Y-%m-%d
    fi
}

# Clear terminal
clear
echo "=== PayloadCMS Advanced Mock Data Generator ==="
echo "Using token: ${PAYLOAD_TOKEN:0:20}..."
echo "================================================"

# Step 1: Create Users
echo -e "\n🧑 Creating Users..."

# Agency User
api_call "POST" "users" '{"email":"agency@test.com", "password": "password123", "role": "agency", "name": "Test Agency"}'
AGENCY_USER_ID=$id

# Nutritionist User 1
api_call "POST" "users" '{"email":"nutritionist1@test.com", "password": "password123", "role": "nutritionist", "name": "First Nutritionist"}'
NUTRITIONIST_USER_ID_1=$id

# Nutritionist User 2
api_call "POST" "users" '{"email":"nutritionist2@test.com", "password": "password123", "role": "nutritionist", "name": "Second Nutritionist"}'
NUTRITIONIST_USER_ID_2=$id

# Athlete User 1
api_call "POST" "users" '{"email":"athlete1@test.com", "password": "password123", "role": "athlete", "name": "First Athlete"}'
ATHLETE_USER_ID_1=$id

# Athlete User 2
api_call "POST" "users" '{"email":"athlete2@test.com", "password": "password123", "role": "athlete", "name": "Second Athlete"}'
ATHLETE_USER_ID_2=$id

# Trainer User
api_call "POST" "users" '{"email":"trainer@test.com", "password": "password123", "role": "trainer", "name": "Test Trainer"}'
TRAINER_USER_ID=$id

# Step 2: Create Agency
echo -e "\n🏢 Creating Agency..."
api_call "POST" "agencies" "{\"user\": $AGENCY_USER_ID, \"name\": \"Test Agency Organization\", \"contact_info\": \"contact@testagency.com\"}"
AGENCY_ID=$id

# Step 3: Create Nutritionist profiles
echo -e "\n🥗 Creating Nutritionists..."
api_call "POST" "nutritionists" "{\"user\": $NUTRITIONIST_USER_ID_1, \"license_number\": \"NUT12345\", \"specialization\": \"Sports Nutrition\"}"
NUTRITIONIST_ID_1=$id

api_call "POST" "nutritionists" "{\"user\": $NUTRITIONIST_USER_ID_2, \"license_number\": \"NUT67890\", \"specialization\": \"Clinical Nutrition\"}"
NUTRITIONIST_ID_2=$id

# Step 4: Create Athlete profiles
echo -e "\n🏋️ Creating Athlete Profiles..."
api_call "POST" "athlete-profiles" "{\"user\": $ATHLETE_USER_ID_1, \"agency\": $AGENCY_ID, \"weight\": 75, \"height\": 180, \"dietary_habits\": \"Prefers high-protein meals\", \"physical_activity_habits\": \"Trains 5 days a week\", \"birth_date\": \"1995-05-15\", \"gender\": \"Male\", \"goal\": \"Muscle gain and performance improvement\"}"
ATHLETE_ID_1=$id

api_call "POST" "athlete-profiles" "{\"user\": $ATHLETE_USER_ID_2, \"agency\": $AGENCY_ID, \"weight\": 65, \"height\": 165, \"dietary_habits\": \"Prefers low-carb diets\", \"physical_activity_habits\": \"Runs daily\", \"birth_date\": \"1992-03-22\", \"gender\": \"Female\", \"goal\": \"Weight loss and endurance\"}"
ATHLETE_ID_2=$id

# Step 5: Create Agency-Professional relationships
echo -e "\n🔗 Creating Agency-Professional Relationships..."
api_call "POST" "agency-professionals" "{\"agency\": $AGENCY_ID, \"professional\": $NUTRITIONIST_USER_ID_1, \"role\": \"Lead Nutritionist\"}"
api_call "POST" "agency-professionals" "{\"agency\": $AGENCY_ID, \"professional\": $NUTRITIONIST_USER_ID_2, \"role\": \"Support Nutritionist\"}"

# Step 6: Create Nutritionist-Athlete relationships
echo -e "\n🔗 Creating Nutritionist-Athlete Relationships..."
api_call "POST" "nutritionist-athletes" "{\"nutritionist\": $NUTRITIONIST_ID_1, \"athlete\": $ATHLETE_ID_1}"
api_call "POST" "nutritionist-athletes" "{\"nutritionist\": $NUTRITIONIST_ID_2, \"athlete\": $ATHLETE_ID_2}"
api_call "POST" "nutritionist-athletes" "{\"nutritionist\": $NUTRITIONIST_ID_1, \"athlete\": $ATHLETE_ID_2}"

# Step 7: Create Food items
echo -e "\n🍗 Creating Food Items..."
api_call "POST" "food" '{"name": "Chicken Breast", "calories_per_100g": 165, "protein_per_100g": 31, "carbs_per_100g": 0, "fat_per_100g": 3.6}'
FOOD1_ID=$id

api_call "POST" "food" '{"name": "Brown Rice", "calories_per_100g": 112, "protein_per_100g": 2.6, "carbs_per_100g": 23.5, "fat_per_100g": 0.9}'
FOOD2_ID=$id

api_call "POST" "food" '{"name": "Broccoli", "calories_per_100g": 34, "protein_per_100g": 2.8, "carbs_per_100g": 6.6, "fat_per_100g": 0.4}'
FOOD3_ID=$id

api_call "POST" "food" '{"name": "Salmon", "calories_per_100g": 208, "protein_per_100g": 20, "carbs_per_100g": 0, "fat_per_100g": 13}'
FOOD4_ID=$id

api_call "POST" "food" '{"name": "Sweet Potato", "calories_per_100g": 86, "protein_per_100g": 1.6, "carbs_per_100g": 20, "fat_per_100g": 0.1}'
FOOD5_ID=$id

api_call "POST" "food" '{"name": "Spinach", "calories_per_100g": 23, "protein_per_100g": 2.9, "carbs_per_100g": 3.6, "fat_per_100g": 0.4}'
FOOD6_ID=$id

api_call "POST" "food" '{"name": "Greek Yogurt", "calories_per_100g": 59, "protein_per_100g": 10, "carbs_per_100g": 3.6, "fat_per_100g": 0.4}'
FOOD7_ID=$id

api_call "POST" "food" '{"name": "Banana", "calories_per_100g": 89, "protein_per_100g": 1.1, "carbs_per_100g": 22.8, "fat_per_100g": 0.3}'
FOOD8_ID=$id

api_call "POST" "food" '{"name": "Oatmeal", "calories_per_100g": 68, "protein_per_100g": 2.4, "carbs_per_100g": 12, "fat_per_100g": 1.4}'
FOOD9_ID=$id

api_call "POST" "food" '{"name": "Eggs", "calories_per_100g": 155, "protein_per_100g": 12.6, "carbs_per_100g": 1.1, "fat_per_100g": 11.5}'
FOOD10_ID=$id

# # Step 8: Create Diet Plans - multiple plans with different date ranges
# echo -e "\n📋 Creating Diet Plans..."
#
# # Dates for different plans
# TODAY=$(date +%Y-%m-%d)
# NEXT_WEEK=$(format_date "+7d")
# NEXT_MONTH=$(format_date "+30d")
# TWO_MONTHS=$(format_date "+60d")
# LAST_WEEK=$(format_date "-7d")
# LAST_MONTH=$(format_date "-30d")
#
# # Current diet plan for athlete 1 - starts today, ends in 30 days
# api_call "POST" "diet-plans" "{\"athlete\": $ATHLETE_ID_1, \"nutritionist\": $NUTRITIONIST_ID_1, \"start_date\": \"$TODAY\", \"end_date\": \"$NEXT_MONTH\", \"total_daily_calories\": 2500, \"notes\": \"Current high-protein plan\"}"
# DIET_PLAN_ID_1=$id
#
# # Future diet plan for athlete 1 - starts in 31 days, ends in 60 days
# api_call "POST" "diet-plans" "{\"athlete\": $ATHLETE_ID_1, \"nutritionist\": $NUTRITIONIST_ID_1, \"start_date\": \"$NEXT_MONTH\", \"end_date\": \"$TWO_MONTHS\", \"total_daily_calories\": 2200, \"notes\": \"Future cutting phase plan\"}"
# DIET_PLAN_ID_2=$id
#
# # Current diet plan for athlete 2
# api_call "POST" "diet-plans" "{\"athlete\": $ATHLETE_ID_2, \"nutritionist\": $NUTRITIONIST_ID_2, \"start_date\": \"$LAST_WEEK\", \"end_date\": \"$NEXT_MONTH\", \"total_daily_calories\": 1800, \"notes\": \"Low-carb diet plan\"}"
# DIET_PLAN_ID_3=$id
#
# # Step 9: Create Diet Plan Days with different repeat intervals
# echo -e "\n📆 Creating Diet Plan Days with various repeat patterns..."
#
# # For Diet Plan 1 (Current plan for athlete 1)
# # Day with 1-day repeat (daily)
# api_call "POST" "diet-plan-days" "{\"diet_plan\": $DIET_PLAN_ID_1, \"date\": \"$TODAY\", \"repeat_interval_days\": 1}"
# DIET_PLAN_DAY1_ID=$id
#
# # Day with 2-day repeat (every other day)
# TOMORROW=$(format_date "+1d")
# api_call "POST" "diet-plan-days" "{\"diet_plan\": $DIET_PLAN_ID_1, \"date\": \"$TOMORROW\", \"repeat_interval_days\": 2}"
# DIET_PLAN_DAY2_ID=$id
#
# # Day with 7-day repeat (weekly)
# NEXT_SUNDAY=$(format_date "+3d")
# api_call "POST" "diet-plan-days" "{\"diet_plan\": $DIET_PLAN_ID_1, \"date\": \"$NEXT_SUNDAY\", \"repeat_interval_days\": 7}"
# DIET_PLAN_DAY3_ID=$id
#
# # For Diet Plan 2 (Future plan for athlete 1)
# # Day without repetition (once only)
# api_call "POST" "diet-plan-days" "{\"diet_plan\": $DIET_PLAN_ID_2, \"date\": \"$NEXT_MONTH\", \"repeat_interval_days\": 0}"
# DIET_PLAN_DAY4_ID=$id
#
# # For Diet Plan 3 (Current plan for athlete 2)
# # Day with 3-day repeat
# api_call "POST" "diet-plan-days" "{\"diet_plan\": $DIET_PLAN_ID_3, \"date\": \"$LAST_WEEK\", \"repeat_interval_days\": 3}"
# DIET_PLAN_DAY5_ID=$id
#
# # Step 10: Create Meals with different types
# echo -e "\n🍽️ Creating Meals..."
#
# # For Diet Plan Day 1 (Daily repeat)
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY1_ID, \"meal_type\": \"Breakfast\", \"scheduled_time\": \"${TODAY}T07:00:00.000Z\", \"order_index\": 1}"
# MEAL1_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY1_ID, \"meal_type\": \"Morning Snack\", \"scheduled_time\": \"${TODAY}T10:00:00.000Z\", \"order_index\": 2}"
# MEAL2_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY1_ID, \"meal_type\": \"Lunch\", \"scheduled_time\": \"${TODAY}T13:00:00.000Z\", \"order_index\": 3}"
# MEAL3_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY1_ID, \"meal_type\": \"Afternoon Snack\", \"scheduled_time\": \"${TODAY}T16:00:00.000Z\", \"order_index\": 4}"
# MEAL4_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY1_ID, \"meal_type\": \"Dinner\", \"scheduled_time\": \"${TODAY}T19:00:00.000Z\", \"order_index\": 5}"
# MEAL5_ID=$id
#
# # For Diet Plan Day 2 (Every other day)
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY2_ID, \"meal_type\": \"Breakfast\", \"scheduled_time\": \"${TOMORROW}T08:00:00.000Z\", \"order_index\": 1}"
# MEAL6_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY2_ID, \"meal_type\": \"Lunch\", \"scheduled_time\": \"${TOMORROW}T13:00:00.000Z\", \"order_index\": 2}"
# MEAL7_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY2_ID, \"meal_type\": \"Dinner\", \"scheduled_time\": \"${TOMORROW}T19:00:00.000Z\", \"order_index\": 3}"
# MEAL8_ID=$id
#
# # For Diet Plan Day 3 (Weekly)
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY3_ID, \"meal_type\": \"Brunch\", \"scheduled_time\": \"${NEXT_SUNDAY}T10:30:00.000Z\", \"order_index\": 1}"
# MEAL9_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY3_ID, \"meal_type\": \"Dinner\", \"scheduled_time\": \"${NEXT_SUNDAY}T18:00:00.000Z\", \"order_index\": 2}"
# MEAL10_ID=$id
#
# # For Diet Plan Day 4 (Future plan, no repeat)
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY4_ID, \"meal_type\": \"Breakfast\", \"scheduled_time\": \"${NEXT_MONTH}T07:00:00.000Z\", \"order_index\": 1}"
# MEAL11_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY4_ID, \"meal_type\": \"Lunch\", \"scheduled_time\": \"${NEXT_MONTH}T12:00:00.000Z\", \"order_index\": 2}"
# MEAL12_ID=$id
#
# # For Diet Plan Day 5 (Athlete 2, every 3 days)
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY5_ID, \"meal_type\": \"Breakfast\", \"scheduled_time\": \"${LAST_WEEK}T08:00:00.000Z\", \"order_index\": 1}"
# MEAL13_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY5_ID, \"meal_type\": \"Lunch\", \"scheduled_time\": \"${LAST_WEEK}T12:30:00.000Z\", \"order_index\": 2}"
# MEAL14_ID=$id
#
# api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY5_ID, \"meal_type\": \"Dinner\", \"scheduled_time\": \"${LAST_WEEK}T18:30:00.000Z\", \"order_index\": 3}"
# MEAL15_ID=$id
#
# # Step 11: Create Meal-Food associations
# echo -e "\n🍳 Creating Meal-Food Associations..."
#
# # For Meal 1 (Breakfast - Daily repeat)
# api_call "POST" "meal-food" "{\"meal\": $MEAL1_ID, \"food\": $FOOD9_ID, \"quantity_grams\": 80}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL1_ID, \"food\": $FOOD8_ID, \"quantity_grams\": 120}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL1_ID, \"food\": $FOOD7_ID, \"quantity_grams\": 150}"
#
# # For Meal 2 (Morning Snack - Daily repeat)
# api_call "POST" "meal-food" "{\"meal\": $MEAL2_ID, \"food\": $FOOD8_ID, \"quantity_grams\": 100}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL2_ID, \"food\": $FOOD7_ID, \"quantity_grams\": 100}"
#
# # For Meal 3 (Lunch - Daily repeat)
# api_call "POST" "meal-food" "{\"meal\": $MEAL3_ID, \"food\": $FOOD1_ID, \"quantity_grams\": 150}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL3_ID, \"food\": $FOOD2_ID, \"quantity_grams\": 100}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL3_ID, \"food\": $FOOD3_ID, \"quantity_grams\": 100}"
#
# # For Meal 4 (Afternoon Snack - Daily repeat)
# api_call "POST" "meal-food" "{\"meal\": $MEAL4_ID, \"food\": $FOOD7_ID, \"quantity_grams\": 200}"
#
# # For Meal 5 (Dinner - Daily repeat)
# api_call "POST" "meal-food" "{\"meal\": $MEAL5_ID, \"food\": $FOOD4_ID, \"quantity_grams\": 150}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL5_ID, \"food\": $FOOD5_ID, \"quantity_grams\": 150}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL5_ID, \"food\": $FOOD6_ID, \"quantity_grams\": 75}"
#
# # For Meal 6 (Breakfast - Every other day)
# api_call "POST" "meal-food" "{\"meal\": $MEAL6_ID, \"food\": $FOOD10_ID, \"quantity_grams\": 100}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL6_ID, \"food\": $FOOD9_ID, \"quantity_grams\": 50}"
#
# # For Meal 7 (Lunch - Every other day)
# api_call "POST" "meal-food" "{\"meal\": $MEAL7_ID, \"food\": $FOOD1_ID, \"quantity_grams\": 120}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL7_ID, \"food\": $FOOD5_ID, \"quantity_grams\": 100}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL7_ID, \"food\": $FOOD6_ID, \"quantity_grams\": 50}"
#
# # For Meal 8 (Dinner - Every other day)
# api_call "POST" "meal-food" "{\"meal\": $MEAL8_ID, \"food\": $FOOD4_ID, \"quantity_grams\": 150}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL8_ID, \"food\": $FOOD3_ID, \"quantity_grams\": 120}"
#
# # For Meal 9 (Brunch - Weekly)
# api_call "POST" "meal-food" "{\"meal\": $MEAL9_ID, \"food\": $FOOD10_ID, \"quantity_grams\": 150}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL9_ID, \"food\": $FOOD8_ID, \"quantity_grams\": 100}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL9_ID, \"food\": $FOOD5_ID, \"quantity_grams\": 100}"
#
# # For Meal 10 (Dinner - Weekly)
# api_call "POST" "meal-food" "{\"meal\": $MEAL10_ID, \"food\": $FOOD1_ID, \"quantity_grams\": 200}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL10_ID, \"food\": $FOOD2_ID, \"quantity_grams\": 150}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL10_ID, \"food\": $FOOD3_ID, \"quantity_grams\": 150}"
#
# # For Meal 11 (Breakfast - Future plan)
# api_call "POST" "meal-food" "{\"meal\": $MEAL11_ID, \"food\": $FOOD9_ID, \"quantity_grams\": 70}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL11_ID, \"food\": $FOOD8_ID, \"quantity_grams\": 100}"
#
# # For Meal 12 (Lunch - Future plan)
# api_call "POST" "meal-food" "{\"meal\": $MEAL12_ID, \"food\": $FOOD1_ID, \"quantity_grams\": 120}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL12_ID, \"food\": $FOOD5_ID, \"quantity_grams\": 120}"
#
# # For Meal 13 (Breakfast - Athlete 2)
# api_call "POST" "meal-food" "{\"meal\": $MEAL13_ID, \"food\": $FOOD10_ID, \"quantity_grams\": 100}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL13_ID, \"food\": $FOOD7_ID, \"quantity_grams\": 150}"
#
# # For Meal 14 (Lunch - Athlete 2)
# api_call "POST" "meal-food" "{\"meal\": $MEAL14_ID, \"food\": $FOOD4_ID, \"quantity_grams\": 125}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL14_ID, \"food\": $FOOD6_ID, \"quantity_grams\": 100}"
#
# # For Meal 15 (Dinner - Athlete 2)
# api_call "POST" "meal-food" "{\"meal\": $MEAL15_ID, \"food\": $FOOD1_ID, \"quantity_grams\": 100}"
# api_call "POST" "meal-food" "{\"meal\": $MEAL15_ID, \"food\": $FOOD3_ID, \"quantity_grams\": 150}"
#
# echo -e "\n✅ Advanced mock data generation complete!"
# echo -e "Created:"
# echo "- Users: 2 Athletes, 2 Nutritionists, 1 Agency, 1 Trainer"
# echo "- Agency with Agency-Professional relationships"
# echo "- Nutritionists with Nutritionist-Athlete relationships"
# echo "- Multiple diet plans with different date ranges"
# echo "- Diet plan days with various repeat intervals (daily, every other day, weekly, etc.)"
# echo "- Multiple meals and food items"
# echo -e "\nTest URLs for the history endpoint:"
# echo "1. Get all meals for athlete 1 (current month):"
# echo "   http://localhost:3000/api/meal/history?athleteId=${ATHLETE_ID_1}&from=${TODAY}&to=${NEXT_MONTH}"
# echo ""
# echo "2. Get all meals for athlete 2 (past to future):"
# echo "   http://localhost:3000/api/meal/history?athleteId=${ATHLETE_ID_2}&from=${LAST_MONTH}&to=${NEXT_MONTH}"
# echo ""
# echo "3. Get meals without repetition for athlete 1:"
# echo "   http://localhost:3000/api/meal/history?athleteId=${ATHLETE_ID_1}&from=${TODAY}&to=${NEXT_WEEK}&includeRepeated=false"
# echo ""
# echo "4. Get meals with nutritionist 1 only:"
# echo "   http://localhost:3000/api/meal/history?athleteId=${ATHLETE_ID_1}&nutritionistId=${NUTRITIONIST_ID_1}&from=${TODAY}&to=${NEXT_MONTH}"

