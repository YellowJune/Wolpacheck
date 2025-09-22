import { useState, useEffect } from 'react'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzNBCv5uogsfdwXCS83QhZAQ-ksVfBYpZmq7vq1ncwYCZ_n7s-dBoHaRxzkAxxUFR2dMw/exec'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Save, Users } from 'lucide-react'

const CLASS_INFO = {
  '2R': { name: '2R', students: 22 },
  '2S': { name: '2S', students: 22 },
  '1R': { name: '1R', students: 20 },
  '1S-F': { name: '1S-F', students: 20 },
  '1S-M': { name: '1S-M', students: 14 }
}

const PERIODS = {
  '1교시': { name: '1교시', score: 0.6 },
  '3교시': { name: '3교시', score: 0.4 }
}

function DeskGrid({ classInfo, attendanceData, onDeskClick, studentNames }) {
  const { students } = classInfo
  const desksPerRow = 4
  const rows = Math.ceil(students / desksPerRow)
  
  const desks = []
  for (let i = 0; i < students; i++) {
    desks.push(i + 1)
  }

  // 2S반은 특별한 좌석 배치
  let deskLayout = {
    leftDesks: [],
    rightDesks: []
  }

  if (classInfo.name === '2S') {
    // 2S반은 2R과 동일하나 21, 22번 책상이 우측열로 이동한것으로 수정.
    // 2R과 동일한 2열 배치 (desksPerRow = 4)를 기본으로 하되, 21, 22번만 우측열로 이동합니다.
    deskLayout.leftDesks = [];
    deskLayout.rightDesks = [];
    for (let i = 1; i <= students; i++) {
      if (i === 21 || i === 22) {
        deskLayout.rightDesks.push(i);
      } else {
        // 2R과 동일한 2열 배치 로직 적용
        if ((i - 1) % desksPerRow < 2) { // 좌측 2칸
          deskLayout.leftDesks.push(i);
        } else { // 우측 2칸
          deskLayout.rightDesks.push(i);
        }
      }
    }
    deskLayout.leftDesks.sort((a, b) => a - b);
    deskLayout.rightDesks.sort((a, b) => a - b);




  } else {
    // 기본 배치 (좌측 2줄, 우측 2줄)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < 2; col++) {
        const deskNumber = row * desksPerRow + col + 1
        if (deskNumber <= students) {
          deskLayout.leftDesks.push(deskNumber)
        }
      }
      for (let col = 2; col < 4; col++) {
        const deskNumber = row * desksPerRow + col + 1
        if (deskNumber <= students) {
          deskLayout.rightDesks.push(deskNumber)
        }
      }
    }
  }

  const renderDeskSection = (desks) => {
    const deskGroups = []
    for (let i = 0; i < desks.length; i += 4) {
      deskGroups.push(desks.slice(i, i + 4))
    }

    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        {deskGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="relative grid grid-cols-2 gap-0 p-0 border-2 border-gray-200 rounded-lg overflow-hidden">
            {group.map((deskNumber, deskIndex) => {
              const isPresent = attendanceData.includes(deskNumber)
              return (
                <div
                  key={deskNumber}
                  onClick={() => onDeskClick(deskNumber)}
                  className={`
                    relative w-12 h-10 sm:w-16 sm:h-12 border border-transparent cursor-pointer transition-all duration-200 hover:scale-105
                    ${isPresent 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                    ${deskIndex === 0 || deskIndex === 1 ? 'border-b-0' : ''}
                    ${deskIndex === 0 || deskIndex === 2 ? 'border-r-0' : ''}
                  `}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold">{deskNumber}</span>
                    {studentNames[classInfo.name] && studentNames[classInfo.name][deskNumber] && (
                      <span className="absolute bottom-1 text-xs opacity-75">{studentNames[classInfo.name][deskNumber]}</span>
                    )}
                  </div>
                </div>
              )
            })}
            {/* 십자가 칸막이 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-full h-0.5 bg-amber-700"></div>
              <div className="absolute h-full w-0.5 bg-amber-700"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="flex items-start space-x-4">
        {/* 좌측 책상들 */}
        {renderDeskSection(deskLayout.leftDesks)}
        
        {/* 통로 - 글씨 제거하고 간격만 유지 */}
        <div className="w-4"></div>
        


        {/* 우측 책상들 */}
        {renderDeskSection(deskLayout.rightDesks)}
      </div>
    </div>
  )
}

function PeriodSelectionModal({ isOpen, onClose, onSave }) {
  const [selectedPeriod, setSelectedPeriod] = useState('')

  const handleSave = () => {
    if (selectedPeriod) {
      onSave(selectedPeriod)
      onClose()
      setSelectedPeriod('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>교시 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="교시를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIODS).map(([key, period]) => (
                <SelectItem key={key} value={key}>
                  {period.name} ({period.score}점)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button onClick={handleSave} disabled={!selectedPeriod} className="flex-1">
              저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ManagePage() {
  const [selectedClass, setSelectedClass] = useState('')
  const [attendanceData, setAttendanceData] = useState([])
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [studentNames, setStudentNames] = useState({}) // { \'2R\': { 1: \'김철수\', 2: \'이영희\' } } 형태로 저장 }
  const [isLoading, setIsLoading] = useState(false)

  // Google Apps Script에서 학생 이름 데이터 불러오기
  useEffect(() => {
    const fetchStudentNames = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${SCRIPT_URL}?action=getStudents`)
        const data = await response.json()
        if (data.success) {
          setStudentNames(data.data)
        } else {
          console.error("Failed to fetch student names:", data.message)
        }
      } catch (error) {
        console.error("Error fetching student names:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudentNames()
  }, [])

  const handleDeskClick = (deskNumber) => {
    setAttendanceData(prev => {
      if (prev.includes(deskNumber)) {
        return prev.filter(num => num !== deskNumber)
      } else {
        return [...prev, deskNumber]
      }
    })
  }

  const handleSaveAttendance = () => {
    if (attendanceData.length === 0) {
      alert('출석할 학생을 선택해주세요.')
      return
    }
    setShowPeriodModal(true)
  }

  const handlePeriodSave = async (period) => {
    const today = new Date().toISOString().split('T')[0]
    const attendanceRecord = {
      date: today,
      class: selectedClass,
      period: period,
      students: attendanceData,
      score: PERIODS[period].score
    }
    
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({ action: 'updateAttendance', ...attendanceRecord }),
      })
      const result = await response.json()

      if (result.success) {
        alert(`${selectedClass} ${period} 출석이 ${result.message.includes('updated') ? '업데이트되었습니다.' : '저장되었습니다.'} (${attendanceData.length}명 출석)`)
      } else {
        alert(`출석 저장 실패: ${result.message}`)
      }
    } catch (error) {
      console.error("Error saving attendance:", error)
      alert('출석 저장 중 오류가 발생했습니다.')
    }
    setAttendanceData([])
  }

  const handleClassChange = async (className) => {
    setSelectedClass(className)
    
    // 오늘 날짜의 기존 출석 데이터 확인 (Google Apps Script에서 가져오기)
    const today = new Date().toISOString().split('T')[0]
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAttendance&date=${today}&class=${className}`)
      const data = await response.json()
      if (data.success && data.data) {
        setAttendanceData(data.data.students || [])
      } else {
        setAttendanceData([])
      }
    } catch (error) {
      console.error("Error fetching attendance for class change:", error)
      setAttendanceData([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>반 선택</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(CLASS_INFO).map(([key, classInfo]) => (
              <Button
                key={key}
                variant={selectedClass === key ? "default" : "outline"}
                onClick={() => handleClassChange(key)}
                className="h-12"
              >
                <div className="text-center">
                  <div className="font-semibold">{classInfo.name}</div>
                  <div className="text-xs opacity-75">{classInfo.students}명</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Desk Layout */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {CLASS_INFO[selectedClass].name} 출석 체크
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              책상을 클릭하여 출석을 선택하세요 (선택됨: {attendanceData.length}명)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <DeskGrid 
              classInfo={CLASS_INFO[selectedClass]}
              attendanceData={attendanceData}
              onDeskClick={handleDeskClick}
              studentNames={studentNames}
            />
            
            {attendanceData.length > 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleSaveAttendance}
                  className="flex items-center space-x-2 px-8"
                  size="lg"
                >
                  <Save className="h-4 w-4" />
                  <span>출석 저장</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <PeriodSelectionModal
        isOpen={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        onSave={handlePeriodSave}
      />
    </div>
  )
}
