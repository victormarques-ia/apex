#!/bin/bash

# Mock Data Generator for PayloadCMS
# Usage: ./create_mock_data.sh [payload_token]

# Define variables
API_URL="http://localhost:3000/api"
PAYLOAD_TOKEN=${1:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY29sbGVjdGlvbiI6InVzZXJzIiwiZW1haWwiOiJ0ZXN0ZUB0ZXN0ZS5jb20iLCJpYXQiOjE3NDMzODEzMTEsImV4cCI6MTc0MzM4ODUxMX0.Gyq19ls5ygWdo_CjU0pRN2vf3GT9Bmf7afu6UoCmEzM"}
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

# Clear terminal
clear
echo "=== PayloadCMS Mock Data Generator ==="
echo "Using token: ${PAYLOAD_TOKEN:0:20}..."
echo "======================================="

# Step 1: Create Users
echo -e "\n🧑 Creating Users..."

# Agency User
api_call "POST" "users" '{"email":"agency@test.com", "password": "password123", "role": "agency", "name": "Test Agency"}'
AGENCY_USER_ID=$id

# Nutritionist User
api_call "POST" "users" '{"email":"nutritionist@test.com", "password": "password123", "role": "nutritionist", "name": "Jéssica"}'
NUTRITIONIST_USER_ID=$id

# Athlete User
api_call "POST" "users" '{"email":"athlete@test.com", "password": "password123", "role": "athlete", "name": "Bianca"}'
ATHLETE_USER_ID=$id

# Trainer User
api_call "POST" "users" '{"email":"trainer@test.com", "password": "password123", "role": "trainer", "name": "Paulo"}'
TRAINER_USER_ID=$id

# Step 2: Create Agency
echo -e "\n🏢 Creating Agency..."
api_call "POST" "agencies" "{\"user\": $AGENCY_USER_ID, \"name\": \"Test Agency Organization\", \"contact_info\": \"contact@testagency.com\"}"
AGENCY_ID=$id

# Step 3: Create Nutritionist profile
echo -e "\n🥗 Creating Nutritionist..."
api_call "POST" "nutritionists" "{\"user\": $NUTRITIONIST_USER_ID, \"license_number\": \"NUT12345\", \"specialization\": \"Sports Nutrition\"}"
NUTRITIONIST_ID=$id

# Step 3: Create Trainer profile
echo -e "\n🥗 Creating Trainer..."
api_call "POST" "trainers" "{\"user\": $TRAINER_USER_ID, \"certification\": \"EF12345\", \"specialization\": \"high performance\"}"
TRAINER_ID=$id

# Step 4: Create Athlete profile
echo -e "\n🏋️ Creating Athlete Profile..."
api_call "POST" "athlete-profiles" "{\"user\": $ATHLETE_USER_ID, \"agency\": $AGENCY_ID, \"weight\": 75, \"height\": 180, \"dietary_habits\": \"Prefers high-protein meals\", \"physical_activity_habits\": \"Trains 5 days a week\", \"birth_date\": \"1995-05-15\", \"gender\": \"Male\", \"goal\": \"Muscle gain and performance improvement\"}"
ATHLETE_ID=$id

# Step 5: Create Agency-Professional relationship
echo -e "\n🔗 Creating Agency-Professional Relationship..."
api_call "POST" "agency-professionals" "{\"agency\": $AGENCY_ID, \"professional\": $NUTRITIONIST_USER_ID, \"role\": \"Lead Nutritionist\"}"

# Step 7: Create Nutritionist-Athlete relationship
echo -e "\n🔗 Creating Nutritionist-Athlete Relationship..."
api_call "POST" "nutritionist-athletes" "{\"nutritionist\": $NUTRITIONIST_ID, \"athlete\": $ATHLETE_ID}"

# Step 6: Create Agency-Professional relationship - Trainer
echo -e "\n🔗 Creating Agency-Professional Relationship for trainer..."
api_call "POST" "agency-professionals" "{\"agency\": $AGENCY_ID, \"professional\": $TRAINER_USER_ID, \"role\": \"trainer\"}"

# Step 7: Create Trainer-Athlete relationship
echo -e "\n🔗 Creating Trainer-Athlete Relationship..."
api_call "POST" "trainer-athletes" "{\"trainer\": $TRAINER_ID, \"athlete\": $ATHLETE_ID}"

# Step 8: Create Food items
echo -e "\n🍗 Creating Food Items..."
api_call "POST" "food" '{"name": "Chicken Breast", "calories_per_100g": 165, "protein_per_100g": 31, "carbs_per_100g": 0, "fat_per_100g": 3.6}'
FOOD1_ID=$id

api_call "POST" "food" '{"name": "Brown Rice", "calories_per_100g": 112, "protein_per_100g": 2.6, "carbs_per_100g": 23.5, "fat_per_100g": 0.9}'
FOOD2_ID=$id

api_call "POST" "food" '{"name": "Broccoli", "calories_per_100g": 34, "protein_per_100g": 2.8, "carbs_per_100g": 6.6, "fat_per_100g": 0.4}'
FOOD3_ID=$id

# Step 8: Create Diet Plan
echo -e "\n📋 Creating Diet Plan..."
TODAY=$(date +%Y-%m-%d)
NEXT_MONTH=$(date -v+30d +%Y-%m-%d 2>/dev/null || date -d "+30 days" +%Y-%m-%d)

api_call "POST" "diet-plans" "{\"athlete\": $ATHLETE_ID, \"nutritionist\": $NUTRITIONIST_ID, \"start_date\": \"$TODAY\", \"end_date\": \"$NEXT_MONTH\", \"total_daily_calories\": 2500, \"notes\": \"Focus on high-protein meals with complex carbs. Adjust based on training intensity.\"}"
DIET_PLAN_ID=$id

# Step 9: Create Diet Plan Days
echo -e "\n📆 Creating Diet Plan Days..."
api_call "POST" "diet-plan-days" "{\"diet_plan\": $DIET_PLAN_ID, \"date\": \"$TODAY\", \"day_of_week\": \"$(date +%A)\"}"
DIET_PLAN_DAY1_ID=$id

TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "+1 day" +%Y-%m-%d)
TOMORROW_DAY=$(date -v+1d +%A 2>/dev/null || date -d "+1 day" +%A)
api_call "POST" "diet-plan-days" "{\"diet_plan\": $DIET_PLAN_ID, \"date\": \"$TOMORROW\", \"day_of_week\": \"$TOMORROW_DAY\"}"
DIET_PLAN_DAY2_ID=$id

# Step 10: Create Meals
echo -e "\n🍽️ Creating Meals..."
api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY1_ID, \"meal_type\": \"Breakfast\", \"scheduled_time\": \"${TODAY}T08:00:00.000Z\", \"order_index\": 1}"
MEAL1_ID=$id

api_call "POST" "meal" "{\"diet_plan_day\": $DIET_PLAN_DAY1_ID, \"meal_type\": \"Lunch\", \"scheduled_time\": \"${TODAY}T13:00:00.000Z\", \"order_index\": 2}"
MEAL2_ID=$id

# Step 11: Create Meal-Food associations
echo -e "\n🍳 Creating Meal-Food Associations..."
api_call "POST" "meal-food" "{\"meal\": $MEAL1_ID, \"food\": $FOOD2_ID, \"quantity_grams\": 100}"
api_call "POST" "meal-food" "{\"meal\": $MEAL2_ID, \"food\": $FOOD1_ID, \"quantity_grams\": 150}"
api_call "POST" "meal-food" "{\"meal\": $MEAL2_ID, \"food\": $FOOD2_ID, \"quantity_grams\": 200}"
api_call "POST" "meal-food" "{\"meal\": $MEAL2_ID, \"food\": $FOOD3_ID, \"quantity_grams\": 150}"

# Step 12: Create Daily Consumption records
echo -e "\n🍴 Creating Daily Consumption Records..."
api_call "POST" "daily-consumption" "{\"athlete\": $ATHLETE_ID, \"food\": $FOOD1_ID, \"date\": \"$TODAY\", \"quantity_grams\": 125}"
api_call "POST" "daily-consumption" "{\"athlete\": $ATHLETE_ID, \"food\": $FOOD2_ID, \"date\": \"$TODAY\", \"quantity_grams\": 175}"

# Step 13: Create Exercicies
echo -e "\n🍴 Creating Exercicies..."
api_call "POST" "exercises" "{\"name\": \"Avanço com Halteres\", \"description\": \"Fortalece glúteos, quadríceps e isquiotibiais, ajudando na estabilidade e impulsão na corrida.\", \"muscle_group\": \"Pernas\"}"
EXERCISE1_ID=$id

api_call "POST" "exercises" "{\"name\": \"Prancha Abdominal\", \"description\": \"Exercício isométrico para fortalecimento do core, essencial para manter a postura durante a corrida.\", \"muscle_group\": \"Abdômen\"}"
EXERCISE2_ID=$id

api_call "POST" "exercises" "{\"name\": \"Elevação de Panturrilhas\", \"description\": \"Trabalha os músculos da panturrilha, importantes para a propulsão e absorção de impacto.\", \"muscle_group\": \"Panturrilhas\"}"
EXERCISE3_ID=$id

# Step 14: Create Workout Plan
echo -e "\n🏃 Creating Workout Plans..."

api_call "POST" "workout-plans" "{\"athlete\": $ATHLETE_ID, \"trainer\": $TRAINER_ID, \"start_date\": \"$TODAY\", \"end_date\": \"$NEXT_MONTH\", \"goal\": \"Preparação para prova de 10 km. Foco em resistência, técnica e prevenção de lesões.\"}"
WORKOUT_PLAN_ID=$id

# Step 15: Add Exercise to Workout Plan
echo -e "\n📌 Adding Exercise to Workout Plan..."

api_call "POST" "exercise-workouts" "{\"workout_plan\": $WORKOUT_PLAN_ID, \"exercise\": $EXERCISE1_ID, \"sets\": 3, \"reps\": 12, \"rest_seconds\": 60, \"notes\": \"Manter boa postura durante o movimento. Foco em controle e estabilidade.\"}"

api_call "POST" "exercise-workouts" "{\"workout_plan\": $WORKOUT_PLAN_ID, \"exercise\": $EXERCISE2_ID, \"sets\": 3, \"reps\": 1, \"rest_seconds\": 30, \"notes\": \"Segurar posição por 30 segundos em cada série.\"}"

api_call "POST" "exercise-workouts" "{\"workout_plan\": $WORKOUT_PLAN_ID, \"exercise\": $EXERCISE3_ID, \"sets\": 4, \"reps\": 15, \"rest_seconds\": 45, \"notes\": \"Executar lentamente. Foco no alongamento e contração da panturrilha.\"}"

# Step X: Log Physical Activity
echo -e "\n🗓️ Logging Physical Activity..."
api_call "POST" "physical-activity-logs" "{\"athlete\": $ATHLETE_ID, \"workout_plan\": $WORKOUT_PLAN_ID, \"date\": \"$TODAY\", \"duration_minutes\": 45, \"calories_burned\": 520}"

echo -e "\n✅ Mock data generation complete!"
echo -e "Created:"
echo "- Users: Agency, Nutritionist, Athlete, Trainer"
echo "- Agency with AgencyProfessional relationship"
echo "- Nutritionist with NutritionistAthlete relationship"
echo "- Athlete Profile"
echo "- Foods: Chicken Breast, Brown Rice, Broccoli"
echo "- Diet Plan with Diet Plan Days"
echo "- Meals with MealFood associations"
echo "- Daily Consumption records"
echo -e "\nAll ready for testing!"