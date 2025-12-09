
public class SetSumCheck {

    public static boolean checkSumExit(int[] set, int n, int sum) {
        if (sum == 0) {
            return true;
        }
        if (n == 0) {
            return false;
        }
        if (set[n - 1] > sum) {
            return checkSumExit(set, n - 1, sum);
        }
        boolean include = checkSumExit(set, n - 1, sum - set[n - 1]);
        boolean exclude = checkSumExit(set, n - 1, sum);
        return include||exclude;
    }

    public static void main(String[] args) {
        int[] set = { 3, 34, 4, 12, 5, 2 };
        int sum = 30;
        int n = set.length;
        boolean returnValue = checkSumExit(set, n, sum);
        System.out.println(returnValue);
    }
}
